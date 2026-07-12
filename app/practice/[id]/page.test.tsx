import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeSessionWrapper } from "./page"
import { usePracticeSummary } from "@/lib/api/practice-hooks"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: () => null }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/practice-session-content", () => ({
  PracticeSessionContent: () => <div>Practice content</div>,
}))

vi.mock("@/components/practice-results-content", () => ({
  PracticeResultsContent: () => <div>Practice results</div>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

vi.mock("@/lib/api/practice-hooks", () => ({
  usePracticeSummary: vi.fn(),
}))

describe("practice session protected route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects logged-out users without showing the missing-session state", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(usePracticeSummary).toHaveBeenCalledWith(9, false)
    expect(screen.getByText("Please sign in to continue")).toBeInTheDocument()
    expect(screen.queryByText("Practice session not found")).not.toBeInTheDocument()
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpractice%2F9")
    })
  })

  it("renders the results view after the authoritative summary is submitted", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: {
        practice_session_id: 9,
        exam_type_id: 1,
        subject_id: 5,
        mode: "MCQ",
        attempt_status: "SUBMITTED",
        mcq_total: 10,
        cq_total: 0,
      },
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(screen.getByText("Practice results")).toBeInTheDocument()
    expect(screen.queryByText("Practice content")).not.toBeInTheDocument()
  })
})
