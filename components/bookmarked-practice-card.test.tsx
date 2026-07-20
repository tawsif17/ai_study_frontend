import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BookmarkedPracticeCard } from "./bookmarked-practice-card"
import { generatePractice } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"

const push = vi.fn()

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api")
  return { ...actual, generatePractice: vi.fn(), matchEntitlementErrorByExactMessage: vi.fn(() => null) }
})
vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))

describe("BookmarkedPracticeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false, user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() })
  })

  it("starts the subject-level saved-question session with the exact backend payload", async () => {
    vi.mocked(generatePractice).mockResolvedValueOnce({ practice_session_id: 99, mcq_total: 3, cq_total: 0 })
    render(<BookmarkedPracticeCard subjectId={5} examTypeId={1} savedQuestionCount={3} />)

    fireEvent.click(screen.getByRole("button", { name: "Practice saved questions" }))

    await waitFor(() => expect(generatePractice).toHaveBeenCalledWith({
      exam_type_id: 1,
      subject_id: 5,
      mode: "MCQ",
      selection: { type: "BOOKMARKED" },
    }))
    expect(push).toHaveBeenCalledWith("/practice/99")
  })

  it("uses the API error code when saved questions disappear before starting", async () => {
    vi.mocked(generatePractice).mockRejectedValueOnce(
      new ApiClientError({ code: "NO_SAVED_QUESTIONS", message: "Backend wording may change" }, 409)
    )
    render(<BookmarkedPracticeCard subjectId={5} examTypeId={1} savedQuestionCount={3} />)

    fireEvent.click(screen.getByRole("button", { name: "Practice saved questions" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("There are no saved questions for this subject right now.")
  })
})
