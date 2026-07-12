import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeSessionContent } from "./practice-session-content"
import { usePracticeAnswers, usePracticeItems } from "@/lib/api/practice-hooks"
import { reportQuestion, saveAnswers, submitPractice } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"

const mockRefresh = vi.fn()
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockMutate = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush, replace: mockReplace }),
}))

vi.mock("swr", () => ({
  default: vi.fn(() => ({
    data: {
      id: 44,
      question_type: "MCQ",
      stem_text: "What is 2 + 2?",
      language: "en",
      options: [
        { label: "A", option_text: "4" },
        { label: "B", option_text: "5" },
        { label: "C", option_text: "6" },
      ],
    },
    isLoading: false,
  })),
  useSWRConfig: () => ({ mutate: mockMutate }),
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
    vi.mocked(saveAnswers).mockResolvedValue({ saved: true })
    vi.mocked(submitPractice).mockResolvedValue({
      practice_session_id: 99,
      mcq_total: 1,
      mcq_correct: 1,
      mcq_score: 1,
    })
    mockMutate.mockResolvedValue(undefined)
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

  function renderSession() {
    return render(
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
  }

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
  }, 10000)

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
  }, 10000)

  it("keeps the latest rapid selection visible and serializes slow saves", async () => {
    const user = userEvent.setup()
    let resolveFirst!: () => void
    let resolveSecond!: () => void
    vi.mocked(saveAnswers)
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          resolveFirst = () => resolve({ saved: true })
        })
      )
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          resolveSecond = () => resolve({ saved: true })
        })
      )

    renderSession()
    await user.click(screen.getByRole("button", { name: /4/ }))
    await user.click(screen.getByRole("button", { name: /5/ }))

    expect(saveAnswers).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: /5/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Saving...")

    resolveFirst()
    await waitFor(() => expect(saveAnswers).toHaveBeenCalledTimes(2))
    expect(saveAnswers).toHaveBeenLastCalledWith(99, {
      answers: [{ practice_item_id: 7, answer_type: "MCQ", selected_option_label: "B" }],
    })

    resolveSecond()
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /5/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("waits for the saved-answer baseline and exposes a retryable load error", async () => {
    const reloadAnswers = vi.fn().mockResolvedValue(undefined)
    vi.mocked(usePracticeAnswers).mockReturnValue({
      answers: undefined,
      isLoading: true,
      isError: undefined,
      mutate: reloadAnswers,
    })

    const view = renderSession()
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument()

    vi.mocked(usePracticeAnswers).mockReturnValue({
      answers: undefined,
      isLoading: false,
      isError: new Error("Saved answers unavailable"),
      mutate: reloadAnswers,
    })
    view.rerender(
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

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load saved answers")
    await userEvent.click(screen.getByRole("button", { name: "Retry loading answers" }))
    expect(reloadAnswers).toHaveBeenCalledTimes(1)
  })

  it("shows a persistent failure, preserves the local answer, and retries explicitly", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers)
      .mockRejectedValueOnce(new ApiClientError({ message: "Answer could not be saved" }, 400))
      .mockResolvedValueOnce({ saved: true })

    renderSession()
    await user.click(screen.getByRole("button", { name: /5/ }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed")
    expect(screen.getByRole("button", { name: /5/ })).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: "Retry saving" }))

    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(saveAnswers).toHaveBeenCalledTimes(2)
    expect(saveAnswers).toHaveBeenLastCalledWith(99, {
      answers: [{ practice_item_id: 7, answer_type: "MCQ", selected_option_label: "B" }],
    })
  })

  it("treats an unconfirmed save response as failed instead of showing Saved", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers).mockResolvedValueOnce({ saved: false })

    renderSession()
    await user.click(screen.getByRole("button", { name: /5/ }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed")
    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /5/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("shows Retrying while a bounded automatic retry is pending", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers)
      .mockRejectedValueOnce(new TypeError("Network connection lost"))
      .mockResolvedValueOnce({ saved: true })

    renderSession()
    await user.click(screen.getByRole("button", { name: /4/ }))

    expect(await screen.findByText("Retrying...")).toBeInTheDocument()
    expect(await screen.findByText("Saved", {}, { timeout: 2000 })).toBeInTheDocument()
    expect(saveAnswers).toHaveBeenCalledTimes(2)
  })

  it("waits for pending saves before submitting and transitioning", async () => {
    const user = userEvent.setup()
    let resolveSave!: () => void
    vi.mocked(saveAnswers).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSave = () => resolve({ saved: true })
      })
    )

    renderSession()
    await user.click(screen.getByRole("button", { name: /4/ }))
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(submitPractice).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Saving answers..." })).toBeDisabled()

    resolveSave()
    await waitFor(() => expect(submitPractice).toHaveBeenCalledTimes(1))
    expect(mockMutate).toHaveBeenCalledWith(["practice-summary", 99])
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it("keeps submission locked when summary refresh fails and retries only the results transition", async () => {
    const user = userEvent.setup()
    mockMutate
      .mockRejectedValueOnce(new Error("Summary unavailable"))
      .mockResolvedValueOnce(undefined)

    renderSession()
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your practice was submitted, but the results could not be loaded"
    )
    expect(screen.getByRole("button", { name: "Submitted" })).toBeDisabled()
    expect(submitPractice).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole("button", { name: "Retry loading results" }))
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))
    expect(mockMutate).toHaveBeenCalledTimes(2)
    expect(submitPractice).toHaveBeenCalledTimes(1)
  })

  it("moves focus to the save failure region when submission is blocked", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers).mockRejectedValueOnce(
      new ApiClientError({ message: "Answer could not be saved" }, 400)
    )

    renderSession()
    await user.click(screen.getByRole("button", { name: /5/ }))
    const failureAlert = await screen.findByRole("alert")
    await user.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => expect(failureAlert.parentElement).toHaveFocus())
    expect(submitPractice).not.toHaveBeenCalled()
  })

  it("prevents duplicate submission calls in the same render window", async () => {
    let resolveSubmit!: () => void
    vi.mocked(submitPractice).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSubmit = () => resolve({
          practice_session_id: 99,
          mcq_total: 1,
          mcq_correct: 0,
          mcq_score: 0,
        })
      })
    )

    renderSession()
    const submit = screen.getByRole("button", { name: "Submit" })
    fireEvent.click(submit)
    fireEvent.click(submit)

    await waitFor(() => expect(submitPractice).toHaveBeenCalledTimes(1))
    resolveSubmit()
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))
  })

  it("recovers an authoritative already-submitted response by refreshing results", async () => {
    const user = userEvent.setup()
    vi.mocked(submitPractice).mockRejectedValueOnce(
      new ApiClientError({ message: "Session already submitted" }, 409)
    )

    renderSession()
    await user.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(["practice-summary", 99]))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument()
  })

  it("guards route-leaving navigation while a save is pending", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers).mockImplementationOnce(() => new Promise(() => {}))

    renderSession()
    await user.click(screen.getByRole("button", { name: /4/ }))

    const link = document.createElement("a")
    link.href = "/subjects"
    link.textContent = "Leave practice"
    document.body.appendChild(link)
    fireEvent.click(link)

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Leave before your answer is saved?")
    expect(mockPush).not.toHaveBeenCalled()

    const beforeUnload = new Event("beforeunload", { cancelable: true })
    expect(window.dispatchEvent(beforeUnload)).toBe(false)

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false)
    const forward = vi.spyOn(window.history, "forward").mockImplementation(() => {})
    fireEvent(window, new PopStateEvent("popstate", { state: {} }))
    expect(confirm).toHaveBeenCalled()
    expect(forward).not.toHaveBeenCalled()
    expect(
      Object.keys(window.history.state ?? {}).some((key) => key.includes("shikkhaPracticeSaveGuard"))
    ).toBe(true)

    await user.click(screen.getByRole("button", { name: "Stay and retry" }))
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    confirm.mockRestore()
    forward.mockRestore()
    link.remove()
  })

  it("uses one confirmed same-origin navigation without submitting or saving again", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers).mockImplementationOnce(() => new Promise(() => {}))

    renderSession()
    await user.click(screen.getByRole("button", { name: /4/ }))

    const link = document.createElement("a")
    link.href = "/subjects"
    link.textContent = "Leave practice"
    document.body.appendChild(link)
    fireEvent.click(link)

    await user.click(await screen.findByRole("button", { name: "Leave without saving" }))
    expect(mockReplace).toHaveBeenCalledWith("/subjects")
    expect(submitPractice).not.toHaveBeenCalled()
    expect(saveAnswers).toHaveBeenCalledTimes(1)
    link.remove()
  })

  it("does not let a stale server snapshot replace a newer local selection", async () => {
    const user = userEvent.setup()
    vi.mocked(saveAnswers).mockImplementationOnce(() => new Promise(() => {}))
    const view = renderSession()

    await user.click(screen.getByRole("button", { name: /5/ }))
    vi.mocked(usePracticeAnswers).mockReturnValue({
      answers: [{
        practice_item_id: 7,
        answer_type: "MCQ",
        selected_option_label: "A",
        cq_text: null,
        updated_at: "2026-07-12T00:00:00.000Z",
      }],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    })
    view.rerender(
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

    expect(screen.getByRole("button", { name: /5/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /4/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("cleans up without announcing success after unmounting an active request", async () => {
    const user = userEvent.setup()
    let resolveSave!: () => void
    vi.mocked(saveAnswers).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSave = () => resolve({ saved: true })
      })
    )
    const view = renderSession()

    await user.click(screen.getByRole("button", { name: /4/ }))
    view.unmount()
    resolveSave()
    await Promise.resolve()

    expect(saveAnswers).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
  })
})
