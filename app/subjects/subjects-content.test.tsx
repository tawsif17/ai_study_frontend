import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SubjectsContent } from "./subjects-content"
import { useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"
import type { AuthUser } from "@/lib/api"

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

const authenticatedUser: AuthUser = {
  id: "student-id",
  email: "student@example.com",
  full_name: "Student Name",
  role: "student",
  plan_tier: "free",
  school: "Example High School",
  city: "Dhaka",
  student_class: 10,
  academic_group: "SCIENCE",
  curriculum_version: "ENGLISH",
  email_verified_at: "2026-08-01T00:00:00.000Z",
  last_login_at: null,
  created_at: "2026-08-01T00:00:00.000Z",
  updated_at: "2026-08-01T00:00:00.000Z",
}

function mockAuth(isAuthenticated: boolean, user: AuthUser = authenticatedUser) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    isLoading: false,
    authStatus: isAuthenticated ? "authenticated" : "unauthenticated",
    authError: null,
    user: isAuthenticated ? user : null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    retryAuth: vi.fn(),
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
    expect(screen.getByRole("heading", { name: "Mathematics" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Chemistry" })).toBeInTheDocument()
    expect(screen.queryByText("Higher Math")).not.toBeInTheDocument()
    expect(screen.getAllByText("MCQ practice available")).toHaveLength(3)
    expect(screen.getByText(/Beta Pro includes Weak Area Analysis and Board-only MCQ sets for more focused revision/)).toBeInTheDocument()
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
      { id: 7, name: "Mathematics" },
      { id: 11, name: "Physics" },
      { id: 19, name: "Chemistry" },
    ])

    render(<SubjectsContent selectedSubjectValue="physics" />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/subjects/11")
    })
    expect(useSubjects).toHaveBeenCalledWith("SSC", true)
  })

  it("renders every authenticated catalogue subject in API order with database names and ID destinations", () => {
    mockAuth(true, { ...authenticatedUser, academic_group: "BUSINESS_STUDIES" })
    mockSubjects([
      { id: 19, name: "Chemistry" },
      { id: 23, name: "Biology" },
      { id: 7, name: "Mathematics" },
      { id: 11, name: "Physics" },
    ])

    render(<SubjectsContent />)

    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Chemistry",
      "Biology",
      "Mathematics",
      "Physics",
    ])
    expect(screen.getByText("Choose chapters and start focused MCQ practice.")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Start Practice" }).map((link) => link.getAttribute("href"))).toEqual([
      "/subjects/19",
      "/subjects/23",
      "/subjects/7",
      "/subjects/11",
    ])
  })

  it("shows the English-only message for an authenticated Bangla student", () => {
    mockAuth(true, { ...authenticatedUser, curriculum_version: "BANGLA" })
    mockSubjects([])

    render(<SubjectsContent />)

    expect(screen.getByText(
      "Only English Version questions are available right now. Bangla Version questions are coming soon—stay tuned."
    )).toBeInTheDocument()
  })

  it("keeps the generic empty state for an English student", () => {
    mockAuth(true)
    mockSubjects([])

    render(<SubjectsContent />)

    expect(screen.getByText("No subjects are available right now. Please check back soon.")).toBeInTheDocument()
  })

  it("shows a recovery state when the saved subject cannot be matched", async () => {
    mockAuth(true)
    mockSubjects([{ id: 7, name: "Mathematics" }])

    render(<SubjectsContent selectedSubjectValue="chemistry" />)

    expect(await screen.findByRole("heading", { name: "Unable to open that subject" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Choose another subject" })).toHaveAttribute("href", "/subjects")
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it.each(["Mathematics", "Higher Mathematics"])(
    "resolves the public Mathematics selection against the catalogue name %s",
    async (catalogueName) => {
      mockAuth(true)
      mockSubjects([{ id: 7, name: catalogueName }])

      render(<SubjectsContent selectedSubjectValue="general-math" />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/subjects/7")
      })
    }
  )
})
