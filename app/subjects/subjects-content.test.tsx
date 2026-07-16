import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SubjectsContent } from "./subjects-content"
import { useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

vi.mock("@/lib/api/hooks", () => ({
  useSubjects: vi.fn(),
}))

function mockAuth(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    isLoading: false,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  })
}

function mockSubjects(subjects: Array<{ id: number; name: string }> | undefined) {
  vi.mocked(useSubjects).mockReturnValue({
    subjects: subjects?.map((subject) => ({
      ...subject,
      exam_type_id: 1,
      exam_type_code: "SSC",
      exam_type_name: "Secondary School Certificate",
    })),
    isLoading: false,
    isError: undefined,
    mutate: vi.fn(),
  })
}

describe("practice page final UI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the public static beta preview without enabling the protected catalog", () => {
    mockAuth(false)
    mockSubjects(undefined)

    render(<SubjectsContent />)

    expect(screen.getByRole("heading", { level: 1, name: "Choose a subject to practice" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Available subjects" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "General Math" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Chemistry" })).toBeInTheDocument()
    expect(screen.queryByText("Higher Math")).not.toBeInTheDocument()
    expect(screen.getAllByText("MCQ practice available")).toHaveLength(3)
    expect(screen.getByText(/Beta Pro includes Board-only MCQ sets and Weak Area Analysis/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "How practice works" })).toHaveAttribute("href", "/how-it-works")

    expect(screen.getAllByRole("link", { name: "Start Practice" })[0]).toHaveAttribute(
      "href",
      "/login?next=%2Fsubjects%3Fsubject%3Dgeneral-math"
    )
    expect(useSubjects).toHaveBeenCalledWith("SSC", false)
  })

  it("resumes a signed-in selected subject through its authenticated catalog ID", async () => {
    mockAuth(true)
    mockSubjects([
      { id: 7, name: "General Math" },
      { id: 11, name: "Physics" },
      { id: 19, name: "Chemistry" },
    ])

    render(<SubjectsContent selectedSubjectValue="physics" />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/subjects/11")
    })
    expect(useSubjects).toHaveBeenCalledWith("SSC", true)
  })

  it("shows a recovery state when the saved subject cannot be matched", async () => {
    mockAuth(true)
    mockSubjects([{ id: 7, name: "General Math" }])

    render(<SubjectsContent selectedSubjectValue="chemistry" />)

    expect(await screen.findByRole("heading", { name: "Unable to open that subject" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Choose another subject" })).toHaveAttribute("href", "/subjects")
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
