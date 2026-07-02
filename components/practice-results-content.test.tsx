import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeResultsContent } from "./practice-results-content"
import { usePracticeResults } from "@/lib/api/practice-hooks"
import { reportQuestion } from "@/lib/api"

vi.mock("@/lib/api/practice-hooks", () => ({
  usePracticeResults: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  reportQuestion: vi.fn(),
}))

describe("PracticeResultsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePracticeResults).mockReturnValue({
      results: {
        practice_session_id: 42,
        section: "MCQ",
        items: [],
        total_in_section: 0,
        page: 1,
        page_size: 10,
      },
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
  })

  it("shows result context without exposing the session ID", () => {
    render(
      <PracticeResultsContent
        practiceId={42}
        summary={{
          practice_session_id: 42,
          exam_type_id: 1,
          subject_id: 5,
          mode: "MCQ",
          attempt_status: "SUBMITTED",
          mcq_total: 1,
          cq_total: 0,
        }}
      />
    )

    expect(screen.getByText("Practice Complete!")).toBeInTheDocument()
    expect(screen.getByText("MCQ Practice")).toBeInTheDocument()
    expect(screen.queryByText(/Session #/i)).not.toBeInTheDocument()
    expect(screen.queryByText("Session #42")).not.toBeInTheDocument()
  })

  it("renders report action for result cards and submits mapped reason code", async () => {
    const user = userEvent.setup()
    vi.mocked(usePracticeResults).mockReturnValue({
      results: {
        practice_session_id: 42,
        section: "MCQ",
        items: [
          {
            section_order_no: 1,
            order_no: 1,
            practice_item_id: 7,
            question: {
              id: 44,
              question_type: "MCQ",
              stem_text: "What is 2 + 2?",
              explanation: "Add the two numbers.",
              difficulty: 1,
              source: "Sample",
              language: "en",
            },
            user_answer: { selected_option_label: "B" },
            mcq: {
              correct_option_label: "A",
              is_correct: false,
              options: [
                { label: "A", option_text: "4" },
                { label: "B", option_text: "5" },
              ],
            },
            media: [],
          },
        ],
        total_in_section: 1,
        page: 1,
        page_size: 10,
      },
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
    vi.mocked(reportQuestion).mockResolvedValueOnce({
      id: 1,
      question_id: 44,
      reason_code: "WRONG_ANSWER",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })

    render(
      <PracticeResultsContent
        practiceId={42}
        summary={{
          practice_session_id: 42,
          exam_type_id: 1,
          subject_id: 5,
          mode: "MCQ",
          attempt_status: "SUBMITTED",
          mcq_total: 1,
          cq_total: 0,
        }}
      />
    )

    await user.click(screen.getByRole("button", { name: "Report Question" }))

    expect(screen.getByText("Wrong Answer")).toBeInTheDocument()
    expect(screen.queryByText("WRONG_ANSWER")).not.toBeInTheDocument()

    await user.click(screen.getByText("Wrong Answer"))
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    expect(reportQuestion).toHaveBeenCalledWith(44, {
      reason_code: "WRONG_ANSWER",
    })
  })
})
