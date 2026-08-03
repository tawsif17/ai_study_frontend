import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BookmarkPracticeItemButton } from "./bookmark-practice-item-button"
import { saveBookmark } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const mutate = vi.fn()

vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }))
vi.mock("@/lib/api", () => ({ saveBookmark: vi.fn() }))
vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))

describe("BookmarkPracticeItemButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: {
        id: "u1",
        email: "student@example.com",
        full_name: "Student",
        role: "student",
        plan_tier: "pro",
        school: null,
        city: null,
        student_class: null,
        email_verified_at: "2026-07-29T00:00:00.000Z",
        last_login_at: null,
        created_at: "",
        updated_at: "",
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
  })

  it("offers Free accounts a Beta Pro link without issuing a bookmark request", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      user: { ...vi.mocked(useAuth)().user!, plan_tier: "free" },
    })
    render(<BookmarkPracticeItemButton practiceItemId={9} />)
    expect(screen.getByRole("link", { name: "Bookmark · Beta Pro" })).toHaveAttribute("href", "/pricing")
    expect(saveBookmark).not.toHaveBeenCalled()
  })

  it("does not expose a mutation or upgrade action before the account resolves", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isLoading: true,
      authStatus: "loading",
      user: null,
    })
    const { container } = render(<BookmarkPracticeItemButton practiceItemId={9} />)
    expect(container).toBeEmptyDOMElement()
    expect(saveBookmark).not.toHaveBeenCalled()
  })

  it("saves the current MCQ practice item and confirms the saved state", async () => {
    const user = userEvent.setup()
    vi.mocked(saveBookmark).mockResolvedValueOnce({ question_id: 42, bookmarked: true, bookmarked_at: "2026-07-20T00:00:00.000Z" })
    render(<BookmarkPracticeItemButton practiceItemId={9} />)

    await user.click(screen.getByRole("button", { name: "Bookmark" }))

    await waitFor(() => expect(saveBookmark).toHaveBeenCalledWith(9))
    expect(screen.getByRole("button", { name: "Bookmarked" })).toBeDisabled()
    expect(mutate).toHaveBeenCalledWith("revision-summary")
  })

  it("resets the confirmation when the displayed practice item changes", async () => {
    const user = userEvent.setup()
    vi.mocked(saveBookmark)
      .mockResolvedValueOnce({ question_id: 42, bookmarked: true, bookmarked_at: "2026-07-20T00:00:00.000Z" })
      .mockResolvedValueOnce({ question_id: 43, bookmarked: true, bookmarked_at: "2026-07-20T00:01:00.000Z" })
    const { rerender } = render(<BookmarkPracticeItemButton practiceItemId={9} />)

    await user.click(screen.getByRole("button", { name: "Bookmark" }))
    await screen.findByRole("button", { name: "Bookmarked" })

    rerender(<BookmarkPracticeItemButton practiceItemId={10} />)

    await user.click(screen.getByRole("button", { name: "Bookmark" }))
    await waitFor(() => expect(saveBookmark).toHaveBeenLastCalledWith(10))
  })
})
