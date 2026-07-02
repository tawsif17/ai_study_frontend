import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeConfigCard } from "./practice-config-card"
import { ListChecks } from "./icons"
import { generatePractice } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()

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
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
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
          mcq_count: 10,
          cq_count: 0,
          language: "en",
        })
      )
      expect(mockPush).toHaveBeenCalledWith("/practice/99")
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
