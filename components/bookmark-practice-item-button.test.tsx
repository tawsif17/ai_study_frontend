import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BookmarkPracticeItemButton } from "./bookmark-practice-item-button"
import { saveBookmark } from "@/lib/api"

const mutate = vi.fn()

vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }))
vi.mock("@/lib/api", () => ({ saveBookmark: vi.fn() }))

describe("BookmarkPracticeItemButton", () => {
  beforeEach(() => vi.clearAllMocks())

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
