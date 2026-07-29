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
    ["revision list", (input: unknown) => parseRevisionListResponse(input, "bookmarks")],
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

  const reviewItem = {
    question_id: 42,
    stem_text: "Which force pulls objects toward Earth?",
    explanation: "Gravity attracts masses.",
    source: null,
    language: "en",
    correct_answer: { label: "A", option_text: "Gravity" },
    subject: { id: 2, name: "Physics" },
    chapter: { id: 7, name: "Force" },
    media: [],
  }

  it("requires the list-kind timestamp and rejects undocumented revision fields", () => {
    expect(
      parseRevisionListResponse(
        {
          page: 1,
          page_size: 20,
          total: 1,
          items: [{ ...reviewItem, bookmarked_at: "2026-07-20T00:00:00.000Z" }],
        },
        "bookmarks"
      )
    ).toMatchObject({ total: 1 })

    expect(
      parseRevisionListResponse(
        {
          page: 1,
          page_size: 20,
          total: 1,
          items: [{ ...reviewItem, last_mistaken_at: "2026-07-20T00:00:00.000Z" }],
        },
        "mistakes"
      )
    ).toMatchObject({ total: 1 })

    expect(() =>
      parseRevisionListResponse(
        { page: 1, page_size: 20, total: 1, items: [reviewItem] },
        "bookmarks"
      )
    ).toThrow(ApiContractError)
    expect(() =>
      parseRevisionListResponse(
        { page: 1, page_size: 20, total: 1, items: [reviewItem] },
        "mistakes"
      )
    ).toThrow(ApiContractError)
    expect(() =>
      parseRevisionListResponse(
        {
          page: 1,
          page_size: 20,
          total: 1,
          items: [{ ...reviewItem, last_mistaken_at: "2026-07-20T00:00:00.000Z" }],
          trace_id: "undocumented",
        },
        "mistakes"
      )
    ).toThrow(ApiContractError)
  })

  it("enforces exact bookmark mutation response contracts", () => {
    expect(() =>
      parseSaveBookmarkResponse({
        question_id: 42,
        bookmarked: false,
        bookmarked_at: "2026-07-20T00:00:00.000Z",
      })
    ).toThrow(ApiContractError)
    expect(() =>
      parseRemoveBookmarkResponse({
        question_id: 42,
        bookmarked: false,
        trace_id: "undocumented",
      })
    ).toThrow(ApiContractError)
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
