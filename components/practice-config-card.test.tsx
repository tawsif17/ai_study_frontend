import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeConfigCard } from "./practice-config-card"
import { ListChecks } from "./icons"
import { generatePractice } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { AuthUser } from "@/lib/api"

const mockPush = vi.fn()
const proUser: AuthUser = {
  id: "user-1",
  email: "student@example.com",
  full_name: "Student",
  role: "student",
  plan_tier: "pro",
  school: null,
  city: null,
  student_class: null,
  email_verified_at: "2026-07-29T00:00:00.000Z",
  last_login_at: null,
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
}
const freeUser: AuthUser = { ...proUser, plan_tier: "free" }

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api")
  return {
    ...actual,
    generatePractice: vi.fn(),
    matchEntitlementErrorByExactMessage: vi.fn(() => null),
  }
})

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

function renderCard(overrides: Partial<React.ComponentProps<typeof PracticeConfigCard>> = {}) {
  return render(
    <PracticeConfigCard
      mode="MCQ"
      subjectId={5}
      examTypeId={1}
      chapterIds={[10]}
      icon={ListChecks}
      title="MCQ Practice"
      subtitle="Multiple choice questions with instant AI feedback."
      tag="Best for quick revision"
      {...overrides}
    />
  )
}

describe("PracticeConfigCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: freeUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
  })

  it("generates MCQ practice in English", async () => {
    vi.mocked(generatePractice).mockResolvedValueOnce({
      practice_session_id: 99,
      mcq_total: 10,
      cq_total: 0,
    })

    renderCard()
    fireEvent.click(screen.getByRole("button", { name: "Start Practice" }))

    await waitFor(() => {
      expect(generatePractice).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "MCQ",
          question_pool: "STANDARD",
          mcq_count: 10,
          cq_count: 0,
          language: "en",
        })
      )
      expect(mockPush).toHaveBeenCalledWith("/practice/99")
    })
  })

  it("offers only the supported Free counts", () => {
    renderCard()
    fireEvent.click(screen.getByRole("combobox", { name: "Number of questions" }))
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "10 questions",
      "20 questions",
      "25 questions",
    ])
  })

  it("sends Free users to Pricing when they choose Board-only without generating", () => {
    renderCard()
    expect(screen.getByText("Beta Pro")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("radio", { name: /Board-only/i }))
    expect(mockPush).toHaveBeenCalledWith("/pricing?next=%2Fsubjects%2F5")
    expect(generatePractice).not.toHaveBeenCalled()
  })

  it("disables pool selection while account entitlements are unresolved", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isLoading: true,
      authStatus: "loading",
      user: null,
    })
    renderCard()
    expect(screen.queryByText("Beta Pro")).not.toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Board-only/i })).toBeDisabled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("generates the exact Board-only payload for Beta Pro", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      authStatus: "authenticated",
      authError: null,
      user: proUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(generatePractice).mockResolvedValueOnce({
      practice_session_id: 100,
      mcq_total: 10,
      cq_total: 0,
    })
    renderCard()
    expect(screen.queryByText("Beta Pro")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("radio", { name: /Board-only/i }))
    fireEvent.click(screen.getByRole("button", { name: "Start Practice" }))
    await waitFor(() => {
      expect(generatePractice).toHaveBeenCalledWith({
        exam_type_id: 1,
        subject_id: 5,
        selection: { type: "CHAPTERS", chapter_ids: [10] },
        mode: "MCQ",
        question_pool: "BOARD_ONLY",
        mcq_count: 10,
        cq_count: 0,
        language: "en",
      })
    })
  })

  it("shows Bangla as coming soon instead of a selectable language", () => {
    renderCard()

    expect(screen.getByText("English")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("Bangla")).toBeInTheDocument()
    expect(screen.getByText("Soon")).toBeInTheDocument()
    expect(screen.queryByRole("combobox", { name: /language/i })).not.toBeInTheDocument()
  })

  it("renders coming-soon modes without allowing practice generation", () => {
    renderCard({
      mode: "CQ",
      title: "CQ Practice",
      availability: "coming-soon",
    })

    const button = screen.getByRole("button", { name: "Coming Soon" })
    expect(button).toBeDisabled()
    expect(screen.getByText("Upcoming")).toBeInTheDocument()

    fireEvent.click(button)
    expect(generatePractice).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
