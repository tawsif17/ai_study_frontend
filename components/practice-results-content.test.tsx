import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculateSessionResultSummary,
  PracticeResultsContent,
  type ResultStatus,
} from "./practice-results-content"
import { useCompletePracticeResults } from "@/lib/api/practice-hooks"
import { useSubjects } from "@/lib/api/hooks"
import { reportQuestion } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"
import type { ResultItem } from "@/lib/api/types"

const mockPush = vi.fn()
const mockMutate = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/lib/api/practice-hooks", () => ({
  useCompletePracticeResults: vi.fn(),
}))

vi.mock("@/lib/api/hooks", () => ({
  useSubjects: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  reportQuestion: vi.fn(),
}))

const summary = {
  practice_session_id: 42,
  exam_type_id: 1,
  subject_id: 5,
  mode: "MCQ" as const,
  attempt_status: "SUBMITTED" as const,
  mcq_total: 3,
  cq_total: 0,
}

function resultItem(
  number: number,
  status: ResultStatus,
  overrides: Partial<ResultItem> = {}
): ResultItem {
  const selected = status === "unanswered" ? null : status === "correct" ? "A" : "B"
  return {
    section_order_no: number,
    order_no: number,
    practice_item_id: 100 + number,
    question: {
      id: 200 + number,
      question_type: "MCQ",
      stem_text: `Question stem ${number}`,
      explanation: `Explanation ${number}`,
      difficulty: 1,
      source: "Sample",
      language: "en",
    },
    user_answer: { selected_option_label: selected },
    mcq: {
      correct_option_label: "A",
      is_correct: status === "correct" ? true : status === "incorrect" ? false : null,
      options: [
        { label: "A", option_text: `Correct option ${number}` },
        { label: "B", option_text: `Other option ${number}` },
      ],
    },
    media: [],
    ...overrides,
  }
}

function mockResults(items: ResultItem[]) {
  vi.mocked(useCompletePracticeResults).mockReturnValue({
    results: {
      practice_session_id: 42,
      section: "MCQ",
      total_in_section: items.length,
      items,
    },
    isLoading: false,
    isError: undefined,
    mutate: mockMutate,
  })
}

describe("practice result calculations", () => {
  it("derives mutually exclusive correct, incorrect, unanswered, and needs-review counts", () => {
    expect(calculateSessionResultSummary([
      resultItem(1, "correct"),
      resultItem(2, "incorrect"),
      resultItem(3, "unanswered"),
    ])).toEqual({
      totalQuestions: 3,
      correctCount: 1,
      incorrectCount: 1,
      unansweredCount: 1,
      needsReviewCount: 2,
      accuracyPercentage: 33,
    })
  })

  it("uses whole-number rounding and guards a zero-question result", () => {
    expect(calculateSessionResultSummary([]).accuracyPercentage).toBe(0)
    expect(calculateSessionResultSummary([
      resultItem(1, "correct"),
      resultItem(2, "correct"),
      resultItem(3, "incorrect"),
    ]).accuracyPercentage).toBe(67)
  })

  it("treats an invalid selected label as unanswered", () => {
    const malformed = resultItem(1, "incorrect", {
      user_answer: { selected_option_label: "Z" },
    })
    expect(calculateSessionResultSummary([malformed]).unansweredCount).toBe(1)
  })
})

describe("PracticeResultsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSubjects).mockReturnValue({
      subjects: [{ id: 5, name: "Physics", exam_type_id: 1, exam_type_code: "SSC", exam_type_name: "SSC" }],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
    mockResults([
      resultItem(1, "correct"),
      resultItem(2, "incorrect"),
      resultItem(3, "unanswered"),
    ])
  })

  it("shows a complete subject-backed summary without inventing chapter context", () => {
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("heading", { level: 1, name: "Physics practice complete" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Complete session summary" })).toHaveTextContent("1")
    expect(screen.getByRole("progressbar", { name: "Session accuracy" })).toHaveAttribute("aria-valuenow", "33")
    expect(screen.queryByText("Light")).not.toBeInTheDocument()
    expect(useSubjects).toHaveBeenCalledWith("SSC", true)
  })

  it("falls back to a factual generic heading when the catalogue name is unavailable", () => {
    vi.mocked(useSubjects).mockReturnValue({ subjects: undefined, isLoading: true, isError: undefined, mutate: vi.fn() })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("heading", { level: 1, name: "Practice complete" })).toBeInTheDocument()
    expect(useSubjects).toHaveBeenCalledWith("SSC", true)
  })

  it("defers the optional subject lookup while complete results are loading", () => {
    vi.mocked(useCompletePracticeResults).mockReturnValue({
      results: undefined,
      isLoading: true,
      isError: undefined,
      mutate: mockMutate,
    })

    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(useSubjects).toHaveBeenCalledWith("SSC", false)
  })

  it("defaults to the first question needing review and marks it reviewed locally", () => {
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("button", { name: "Question 2, needs review, selected" })).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("navigation", { name: "Result questions" })).toHaveClass("grid-cols-1")
    expect(screen.getByRole("button", { name: "Question 2, needs review, selected" })).toHaveClass("w-full", "justify-between")
    expect(screen.getByText("Reviewed 1 of 2")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Question 2 of 3" })).toBeInTheDocument()
  })

  it("defaults to question one and calmly disables mistake review for an all-correct session", () => {
    mockResults([resultItem(1, "correct"), resultItem(2, "correct")])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("button", { name: "Question 1, correct, selected" })).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("button", { name: "No mistakes to review" })).toBeDisabled()
  })

  it("navigates by question number without reloading the complete result set", async () => {
    const user = userEvent.setup()
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Question 1, correct" }))

    expect(screen.getByRole("heading", { name: "Question 1 of 3" })).toBeInTheDocument()
    expect(useCompletePracticeResults).toHaveBeenCalledTimes(1)
  })

  it("moves to the next mistake, includes unanswered questions, and wraps", async () => {
    const user = userEvent.setup()
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Review next mistake" }))
    expect(screen.getByRole("button", { name: "Question 3, unanswered, selected" })).toHaveAttribute("aria-current", "true")
    expect(screen.getByText("Reviewed 2 of 2")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Review next mistake" }))
    expect(screen.getByRole("button", { name: "Question 2, needs review, selected" })).toHaveAttribute("aria-current", "true")
  })

  it("supports previous and next navigation with correct disabled endpoints", async () => {
    const user = userEvent.setup()
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Previous question" }))
    expect(screen.getByRole("heading", { name: "Question 1 of 3" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous question" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Next question" }))
    await user.click(screen.getByRole("button", { name: "Next question" }))
    expect(screen.getByRole("button", { name: "Next question" })).toBeDisabled()
  })

  it("labels a selected correct answer as both the student's and correct answer", () => {
    mockResults([resultItem(1, "correct")])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByText("Your answer · Correct answer")).toBeInTheDocument()
    expect(screen.getByText("Correct option 1")).toBeInTheDocument()
  })

  it("compares an incorrect selected answer with the correct answer using visible text", () => {
    mockResults([resultItem(1, "incorrect")])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByText("Your answer")).toBeInTheDocument()
    expect(screen.getByText("Correct answer")).toBeInTheDocument()
  })

  it("shows an explicit unanswered state while still identifying the correct answer", () => {
    mockResults([resultItem(1, "unanswered")])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByText("No answer submitted")).toBeInTheDocument()
    expect(screen.getByText("Correct answer")).toBeInTheDocument()
  })

  it("uses calm fallbacks for missing question text, explanation, and answer options", () => {
    mockResults([resultItem(1, "unanswered", {
      question: {
        id: 201,
        question_type: "MCQ",
        stem_text: null,
        explanation: null,
        difficulty: null,
        source: null,
        language: "en",
      },
      mcq: { correct_option_label: null, is_correct: null, options: [] },
    })])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByText("This question text is unavailable.")).toBeInTheDocument()
    expect(screen.getByText("No explanation is available for this question yet.")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Answer options unavailable" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Report Question" })).toBeInTheDocument()
  })

  it("preserves question reporting with mapped reasons and success feedback", async () => {
    const user = userEvent.setup()
    vi.mocked(reportQuestion).mockResolvedValueOnce({
      id: 1,
      question_id: 202,
      reason_code: "WRONG_ANSWER",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Report Question" }))
    expect(screen.queryByText("WRONG_ANSWER")).not.toBeInTheDocument()
    await user.click(screen.getByText("Wrong Answer"))
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    expect(reportQuestion).toHaveBeenCalledWith(202, { reason_code: "WRONG_ANSWER" })
    expect(await screen.findByText("Question report submitted successfully.")).toBeInTheDocument()
  })

  it("announces report failures and re-enables submission", async () => {
    const user = userEvent.setup()
    vi.mocked(reportQuestion).mockRejectedValueOnce(
      new ApiClientError({ message: "Report could not be sent" }, 400)
    )
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Report Question" }))
    await user.click(screen.getByText("Typo"))
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Report could not be sent")
    expect(screen.getByRole("button", { name: "Submit report" })).toBeEnabled()
  })

  it("prevents duplicate report submissions while the request is pending", async () => {
    const user = userEvent.setup()
    let resolveReport!: (value: Awaited<ReturnType<typeof reportQuestion>>) => void
    vi.mocked(reportQuestion).mockReturnValueOnce(new Promise((resolve) => {
      resolveReport = resolve
    }))
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await user.click(screen.getByRole("button", { name: "Report Question" }))
    await user.click(screen.getByText("Typo"))
    await user.click(screen.getByRole("button", { name: "Submit report" }))

    const pendingButton = screen.getByRole("button", { name: "Submitting..." })
    expect(pendingButton).toBeDisabled()
    await user.click(pendingButton)
    expect(reportQuestion).toHaveBeenCalledTimes(1)

    resolveReport({
      id: 1,
      question_id: 202,
      reason_code: "TYPO",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })
    expect(await screen.findByText("Question report submitted successfully.")).toBeInTheDocument()
  })

  it("shows no partial score during loading", () => {
    vi.mocked(useCompletePracticeResults).mockReturnValue({ results: undefined, isLoading: true, isError: undefined, mutate: mockMutate })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("status", { name: "Loading complete practice results" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: "Session accuracy" })).not.toBeInTheDocument()
  })

  it("shows an explicit empty state for a submitted session with no MCQs", () => {
    mockResults([])
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("heading", { name: "No MCQ results available" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: "Session accuracy" })).not.toBeInTheDocument()
  })

  it("shows a recoverable complete-load error and Retry invokes real revalidation", async () => {
    const user = userEvent.setup()
    vi.mocked(useCompletePracticeResults).mockReturnValue({
      results: undefined,
      isLoading: false,
      isError: new Error("Page 2 unavailable"),
      mutate: mockMutate,
    })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("heading", { name: "Unable to load complete results" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: "Session accuracy" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(mockMutate).toHaveBeenCalledTimes(1)
  })

  it("redirects an expired results request while preserving the intended destination", async () => {
    vi.mocked(useCompletePracticeResults).mockReturnValue({
      results: undefined,
      isLoading: false,
      isError: new ApiClientError({ message: "Unauthorized" }, 401),
      mutate: mockMutate,
    })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpractice%2F42"))
    expect(screen.getByRole("heading", { name: "Please sign in again" })).toBeInTheDocument()
  })

  it("differentiates forbidden and not-found result failures", () => {
    vi.mocked(useCompletePracticeResults).mockReturnValue({ results: undefined, isLoading: false, isError: new ApiClientError({ message: "Forbidden" }, 403), mutate: mockMutate })
    const { rerender } = render(<PracticeResultsContent practiceId={42} summary={summary} />)
    expect(screen.getByRole("heading", { name: "These results are not available to this account" })).toBeInTheDocument()

    vi.mocked(useCompletePracticeResults).mockReturnValue({ results: undefined, isLoading: false, isError: new ApiClientError({ message: "Not found" }, 404), mutate: mockMutate })
    rerender(<PracticeResultsContent practiceId={42} summary={summary} />)
    expect(screen.getByRole("heading", { name: "Practice session not found" })).toBeInTheDocument()
  })

  it("explains that an unsubmitted session cannot show answer review", () => {
    vi.mocked(useCompletePracticeResults).mockReturnValue({ results: undefined, isLoading: false, isError: new ApiClientError({ message: "Not submitted" }, 409), mutate: mockMutate })
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("heading", { name: "Practice is not submitted yet" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: "Session accuracy" })).not.toBeInTheDocument()
  })

  it("shows the real Weak Areas route and omits unsupported controls and dead footer copy", () => {
    render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("link", { name: "View weak areas" })).toHaveAttribute("href", "/dashboard/weak-areas")
    expect(screen.queryByRole("button", { name: /CQ Results/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Mixed/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Refund Policy")).not.toBeInTheDocument()
  })

  it("links incorrect submitted answers to the active Mistakes list only", () => {
    const { unmount } = render(<PracticeResultsContent practiceId={42} summary={summary} />)

    expect(screen.getByRole("link", { name: "View mistakes" })).toHaveAttribute("href", "/bookmarks?tab=mistakes")

    unmount()
    mockResults([resultItem(1, "correct")])
    const { queryByRole } = render(<PracticeResultsContent practiceId={42} summary={summary} />)
    expect(queryByRole("link", { name: "View mistakes" })).not.toBeInTheDocument()
  })
})
