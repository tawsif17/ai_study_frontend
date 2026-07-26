import { describe, expect, it } from "vitest"
import { ApiContractError } from "./client"
import {
  parseGetAnswersResponse,
  parsePracticeGenerateResponse,
  parsePracticeItemsResponse,
  parsePracticeSummaryResponse,
  parseProgressDashboardResponse,
  parseRemoveBookmarkResponse,
  parseResultsJumpResponse,
  parseResultsResponse,
  parseRevisionListResponse,
  parseRevisionSummaryResponse,
  parseSaveAnswersResponse,
  parseSaveBookmarkResponse,
  parseSubmitResponse,
} from "./response-contracts"

describe("practice and revision response contracts", () => {
  it.each([
    ["practice generation", parsePracticeGenerateResponse],
    ["revision list", parseRevisionListResponse],
    ["revision summary", parseRevisionSummaryResponse],
    ["bookmark save", parseSaveBookmarkResponse],
    ["bookmark removal", parseRemoveBookmarkResponse],
    ["progress dashboard", parseProgressDashboardResponse],
    ["practice summary", parsePracticeSummaryResponse],
    ["practice items", parsePracticeItemsResponse],
    ["answer save", parseSaveAnswersResponse],
    ["saved answers", parseGetAnswersResponse],
    ["practice submission", parseSubmitResponse],
    ["practice results", parseResultsResponse],
    ["result jump", parseResultsJumpResponse],
  ])("rejects a malformed %s response", (_name, parse) => {
    expect(() => parse({ unexpected: true })).toThrow(ApiContractError)
  })

  it("accepts forward-compatible additions without exposing unvalidated replacements", () => {
    expect(
      parsePracticeGenerateResponse({
        practice_session_id: 42,
        mcq_total: 20,
        cq_total: 0,
        trace_id: "server-added-field",
      })
    ).toMatchObject({
      practice_session_id: 42,
      mcq_total: 20,
      cq_total: 0,
      trace_id: "server-added-field",
    })
  })

  it("accepts both documented practice-summary response shapes", () => {
    expect(
      parsePracticeSummaryResponse({
        practice_session_id: 42,
        exam_type_id: 1,
        subject_id: 2,
        mode: "MCQ",
        attempt_status: "IN_PROGRESS",
      })
    ).toMatchObject({ practice_session_id: 42 })

    expect(
      parsePracticeSummaryResponse({
        session: {
          id: 42,
          exam_type_id: 1,
          subject_id: 2,
          mode: "MCQ",
          attempt_status: "IN_PROGRESS",
        },
        totals: { mcq_total: 20, cq_total: 0 },
      })
    ).toMatchObject({ session: { id: 42 } })
  })
})
