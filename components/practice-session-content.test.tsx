import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeSessionContent } from "./practice-session-content"
import { usePracticeAnswers, usePracticeItems } from "@/lib/api/practice-hooks"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock("swr", () => ({
  default: vi.fn(() => ({
    data: {
      id: 44,
      question_type: "MCQ",
      stem_text: "What is 2 + 2?",
      language: "en",
      options: [{ label: "A", option_text: "4" }],
    },
    isLoading: false,
  })),
  useSWRConfig: () => ({ mutate: vi.fn() }),
}))

vi.mock("@/lib/api/practice-hooks", () => ({
  usePracticeAnswers: vi.fn(),
  usePracticeItems: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  getQuestionById: vi.fn(),
  saveAnswers: vi.fn(),
  submitPractice: vi.fn(),
}))

describe("PracticeSessionContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePracticeItems).mockReturnValue({
      items: [{ section_order_no: 1, order_no: 1, practice_item_id: 7, question_id: 44 }],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
    vi.mocked(usePracticeAnswers).mockReturnValue({
      answers: [],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
  })

  it("keeps learner-facing numbering but hides the database question ID", () => {
    render(
      <PracticeSessionContent
        practiceId={99}
        summary={{
          practice_session_id: 99,
          exam_type_id: 1,
          subject_id: 5,
          mode: "MCQ",
          attempt_status: "IN_PROGRESS",
          mcq_total: 1,
          cq_total: 0,
        }}
      />
    )

    expect(screen.getByText("Q1")).toBeInTheDocument()
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument()
    expect(screen.queryByText(/Question ID/i)).not.toBeInTheDocument()
    expect(screen.queryByText("44")).not.toBeInTheDocument()
  })
})
