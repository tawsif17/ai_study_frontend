import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SubjectDetailWrapper } from "./page"
import { useExamTypes, useQuestions, useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()
const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND")
})

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/subject-detail-content", () => ({
  SubjectDetailContent: ({ subjectName }: { subjectName: string }) => <div>{subjectName}</div>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

vi.mock("@/lib/api/hooks", () => ({
  useExamTypes: vi.fn(),
  useQuestions: vi.fn(),
  useSubjects: vi.fn(),
}))

describe("subject detail protected route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useExamTypes).mockReturnValue({
      examTypes: [{ id: 1, code: "SSC", name: "SSC" }],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
    vi.mocked(useQuestions).mockReturnValue({
      questions: undefined,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
  })

  it("redirects logged-out users without reaching the not-found state", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
    vi.mocked(useSubjects).mockReturnValue({
      subjects: undefined,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    render(<SubjectDetailWrapper subjectId={5} />)

    expect(screen.getByText("Redirecting to login")).toBeInTheDocument()
    expect(mockNotFound).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fsubjects%2F5")
    })
  })

  it("uses not-found for authenticated users when the subject is missing", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
    vi.mocked(useSubjects).mockReturnValue({
      subjects: [],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })

    expect(() => render(<SubjectDetailWrapper subjectId={5} />)).toThrow("NEXT_NOT_FOUND")
    expect(mockNotFound).toHaveBeenCalled()
  })
})
