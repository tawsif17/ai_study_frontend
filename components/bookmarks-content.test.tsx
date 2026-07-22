import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BookmarksContent } from "./bookmarks-content"
import { removeBookmark } from "@/lib/api"
import { useChapters, useRevisionItems, useRevisionSummary } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

const replace = vi.fn()
const mutateItems = vi.fn()
const mutateSummary = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))
vi.mock("@/lib/api/hooks", () => ({
  useChapters: vi.fn(),
  useRevisionItems: vi.fn(),
  useRevisionSummary: vi.fn(),
}))
vi.mock("@/lib/api", () => ({ removeBookmark: vi.fn() }))

const summary = {
  bookmark_total: 1,
  active_mistake_total: 1,
  saved_question_total: 2,
  subjects: [{ subject_id: 2, subject_name: "Physics", bookmark_count: 1, active_mistake_count: 1, saved_question_count: 2 }],
}

const bookmarkItem = {
  question_id: 42,
  stem_text: "What is the speed of light?",
  explanation: "It is the standard value used in school physics.",
  source: null,
  language: "en",
  correct_answer: { label: "A", option_text: "3 x 10^8 m/s" },
  subject: { id: 2, name: "Physics" },
  chapter: { id: 7, name: "Light" },
  media: [],
  bookmarked_at: "2026-07-20T00:00:00.000Z",
}

describe("BookmarksContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false, authStatus: "authenticated", authError: null, user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn(), refreshUser: vi.fn(), retryAuth: vi.fn() })
    vi.mocked(useRevisionSummary).mockReturnValue({ summary, isLoading: false, isError: undefined, mutate: mutateSummary })
    vi.mocked(useRevisionItems).mockReturnValue({ revisionItems: { page: 1, page_size: 20, total: 1, items: [bookmarkItem] }, isLoading: false, isError: undefined, mutate: mutateItems })
    vi.mocked(useChapters).mockReturnValue({ chapters: [{ id: 7, subject_id: 2, chapter_name: "Light", order_no: 1 }], isLoading: false, isError: undefined, mutate: vi.fn() })
  })

  it("shows manual saves with their correct answer and explanation, then removes only the bookmark", async () => {
    const user = userEvent.setup()
    vi.mocked(removeBookmark).mockResolvedValueOnce({ question_id: 42, bookmarked: false })
    render(<BookmarksContent />)

    expect(screen.getByRole("heading", { name: "Bookmarks" })).toBeInTheDocument()
    expect(screen.getByText("What is the speed of light?")).toBeInTheDocument()
    expect(screen.getByText("Correct answer")).toBeInTheDocument()
    expect(screen.getByText("3 x 10^8 m/s")).toBeInTheDocument()
    expect(screen.getByText("It is the standard value used in school physics.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove bookmark" }))

    await waitFor(() => expect(removeBookmark).toHaveBeenCalledWith(42))
    expect(mutateItems).toHaveBeenCalled()
    expect(mutateSummary).toHaveBeenCalled()
  })

  it("switches to the active mistakes tab through the URL state", async () => {
    const user = userEvent.setup()
    render(<BookmarksContent />)

    await user.click(screen.getByRole("tab", { name: /Mistakes 1/ }))

    expect(replace).toHaveBeenCalledWith("/bookmarks?tab=mistakes", { scroll: false })
  })

  it("supports automatic keyboard tab navigation and associates the active panel", () => {
    render(<BookmarksContent />)
    const bookmarksTab = screen.getByRole("tab", { name: /Bookmarks 1/ })

    fireEvent.keyDown(bookmarksTab, { key: "ArrowRight" })

    const mistakesTab = screen.getByRole("tab", { name: /Mistakes 1/ })
    expect(mistakesTab).toHaveFocus()
    expect(mistakesTab).toHaveAttribute("aria-controls", "bookmarks-panel")
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "bookmarks-tab-mistakes")
  })

  it("renders browser-safe question media returned by the revision API", () => {
    vi.mocked(useRevisionItems).mockReturnValue({
      revisionItems: {
        page: 1,
        page_size: 20,
        total: 1,
        items: [{
          ...bookmarkItem,
          media: [
            {
              link_id: 11,
              question_part_id: null,
              option_id: null,
              caption: "Ray diagram",
              public_url: "https://cdn.example.com/ray.png",
              media_type: "IMAGE",
              mime_type: "image/png",
            },
            {
              link_id: 12,
              question_part_id: null,
              option_id: null,
              caption: null,
              public_url: null,
              media_type: "PDF",
              mime_type: null,
            },
          ],
        }],
      },
      isLoading: false,
      isError: undefined,
      mutate: mutateItems,
    })

    render(<BookmarksContent />)

    expect(screen.getByRole("img", { name: "Ray diagram" })).toBeInTheDocument()
  })

  it("returns to the previous page after removing its final item", async () => {
    const user = userEvent.setup()
    vi.mocked(useRevisionItems).mockReturnValue({
      revisionItems: { page: 1, page_size: 20, total: 21, items: [bookmarkItem] },
      isLoading: false,
      isError: undefined,
      mutate: mutateItems,
    })
    vi.mocked(removeBookmark).mockResolvedValueOnce({ question_id: 42, bookmarked: false })
    mutateItems.mockResolvedValueOnce({ page: 2, page_size: 20, total: 20, items: [] })
    render(<BookmarksContent />)

    await user.click(screen.getByRole("button", { name: /Next/ }))
    await waitFor(() => expect(useRevisionItems).toHaveBeenLastCalledWith(
      "bookmarks",
      expect.objectContaining({ page: 2 }),
      true
    ))
    await user.click(screen.getByRole("button", { name: "Remove bookmark" }))

    await waitFor(() => expect(useRevisionItems).toHaveBeenLastCalledWith(
      "bookmarks",
      expect.objectContaining({ page: 1 }),
      true
    ))
  })
})
