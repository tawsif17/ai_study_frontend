import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { parsePracticeId, PracticeSessionWrapper } from "./page"
import { usePracticeSummary } from "@/lib/api/practice-hooks"
import { useAuth } from "@/lib/auth-context"
import { ApiClientError } from "@/lib/api/client"

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

  it("accepts only positive integer practice IDs", () => {
    expect(parsePracticeId("9")).toBe(9)
    expect(parsePracticeId("abc")).toBeNull()
    expect(parsePracticeId("9abc")).toBeNull()
    expect(parsePracticeId("1.5")).toBeNull()
    expect(parsePracticeId("0")).toBeNull()
    expect(parsePracticeId("-1")).toBeNull()
  })

  it("announces authentication loading without rendering session content", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      authStatus: "loading",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(screen.getByRole("status", { name: "Loading practice session" })).toBeInTheDocument()
    expect(screen.queryByText("Practice content")).not.toBeInTheDocument()
  })

  it("redirects logged-out users without showing the missing-session state", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      authStatus: "unauthenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
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
      authStatus: "authenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
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

  it("keeps an unsubmitted session in the practice experience", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: {
        practice_session_id: 9,
        exam_type_id: 1,
        subject_id: 5,
        mode: "MCQ",
        attempt_status: "IN_PROGRESS",
        mcq_total: 10,
        cq_total: 0,
      },
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(screen.getByText("Practice content")).toBeInTheDocument()
    expect(screen.queryByText("Practice results")).not.toBeInTheDocument()
  })

  it.each([
    [403, "Practice session unavailable"],
    [404, "Practice session not found"],
    [500, "Unable to load practice session"],
  ])("differentiates a %s summary failure", (status, heading) => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: new ApiClientError({ message: heading }, status),
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
  })

  it("redirects an expired authenticated request to login with its destination", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(usePracticeSummary).mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: new ApiClientError({ message: "Unauthorized" }, 401),
      mutate: vi.fn(),
    })

    render(<PracticeSessionWrapper practiceId={9} />)

    expect(screen.getByRole("heading", { name: "Please sign in again" })).toBeInTheDocument()
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpractice%2F9"))
  })
})
