import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PracticeResultsContent } from "./practice-results-content"
import { usePracticeResults } from "@/lib/api/practice-hooks"

vi.mock("@/lib/api/practice-hooks", () => ({
  usePracticeResults: vi.fn(),
}))

describe("PracticeResultsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePracticeResults).mockReturnValue({
      results: {
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
})
