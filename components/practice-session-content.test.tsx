import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeSessionContent } from "./practice-session-content"
import { usePracticeAnswers, usePracticeItems } from "@/lib/api/practice-hooks"
import { reportQuestion } from "@/lib/api"

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
  reportQuestion: vi.fn(),
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

  it("reports the current question with readable reasons mapped to enum values", async () => {
    const user = userEvent.setup()
    vi.mocked(reportQuestion).mockResolvedValueOnce({
      id: 1,
      question_id: 44,
      reason_code: "OUT_OF_SYLLABUS",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })

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

    await user.click(screen.getByRole("button", { name: "Report Question" }))

    expect(screen.getByText("Out of Syllabus")).toBeInTheDocument()
    expect(screen.queryByText("OUT_OF_SYLLABUS")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Submit report" })).toBeDisabled()

    await user.click(screen.getByText("Out of Syllabus"))
    await user.type(
      screen.getByLabelText(/Details/i),
      " This topic is no longer in the current SSC syllabus. "
    )
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    expect(reportQuestion).toHaveBeenCalledWith(44, {
      reason_code: "OUT_OF_SYLLABUS",
      details: " This topic is no longer in the current SSC syllabus. ",
    })
    expect(await screen.findByText("Question report submitted successfully.")).toBeInTheDocument()
  })

  it("shows backend report errors", async () => {
    const user = userEvent.setup()
    vi.mocked(reportQuestion).mockRejectedValueOnce(
      new Error("You have already reported this question for this reason")
    )

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

    await user.click(screen.getByRole("button", { name: "Report Question" }))

    expect(screen.getByLabelText(/Details/i)).toHaveAttribute("maxlength", "1000")

    await user.click(screen.getByText("Typo"))
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    expect(
      await screen.findByText("You have already reported this question for this reason")
    ).toBeInTheDocument()
  })
})
