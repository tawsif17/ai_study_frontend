import { describe, expect, it } from "vitest"
import { ApiContractError } from "./client"
import {
  parseGetAnswersResponse,
  parsePracticeGenerateResponse,
  parsePracticeItemsResponse,
  parsePracticeSummaryResponse,
  parseProgressDashboardResponse,
  parseQuestionDetailResponse,
  parseQuestionsListResponse,
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
    ["question list", parseQuestionsListResponse],
    ["question detail", parseQuestionDetailResponse],
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

  it("rejects undocumented practice-generation response fields", () => {
    expect(() =>
      parsePracticeGenerateResponse({
        practice_session_id: 42,
        mcq_total: 20,
        cq_total: 0,
        trace_id: "server-added-field",
      })
    ).toThrow(ApiContractError)
  })

  it("enforces the exact active-practice response contracts", () => {
    const itemsResponse = {
      practice_session_id: 42,
      section: "MCQ",
      page: 1,
      page_size: 20,
      total_in_section: 1,
      items: [{
        practice_item_id: 7,
        order_no: 1,
        section: "MCQ",
        section_order_no: 1,
        question_id: 9,
      }],
    }
    expect(parsePracticeItemsResponse(itemsResponse)).toEqual(itemsResponse)
    expect(() =>
      parsePracticeItemsResponse({
        ...itemsResponse,
        items: [{ ...itemsResponse.items[0], trace_id: "undocumented" }],
      })
    ).toThrow(ApiContractError)

    expect(parseSaveAnswersResponse({ saved: true })).toEqual({ saved: true })
    expect(() => parseSaveAnswersResponse({ saved: false })).toThrow(ApiContractError)
    expect(() => parseSaveAnswersResponse({ saved: true, trace_id: "undocumented" })).toThrow(
      ApiContractError
    )

    const answersResponse = {
      answers: [{
        practice_item_id: 7,
        answer_type: "MCQ",
        selected_option_label: "A",
        cq_text: null,
        updated_at: "2026-07-30T00:00:00.000Z",
      }],
    }
    expect(parseGetAnswersResponse(answersResponse)).toEqual(answersResponse)
    expect(() =>
      parseGetAnswersResponse({
        answers: [{ ...answersResponse.answers[0], trace_id: "undocumented" }],
      })
    ).toThrow(ApiContractError)

    const submitResponse = {
      practice_session_id: 42,
      mcq_total: 10,
      mcq_correct: 8,
      mcq_score: 8,
    }
    expect(parseSubmitResponse(submitResponse)).toEqual(submitResponse)
    expect(() => parseSubmitResponse({ ...submitResponse, mcq_score: 7.5 })).toThrow(
      ApiContractError
    )
    expect(() => parseSubmitResponse({ ...submitResponse, trace_id: "undocumented" })).toThrow(
      ApiContractError
    )
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

  it("accepts only the documented nested practice summary with question_pool", () => {
    expect(
      parsePracticeSummaryResponse({
        session: {
          id: 42,
          user_id: "user-1",
          exam_type_id: 1,
          subject_id: 2,
          selection_mode: "CHAPTERS",
          syllabus_version_id: null,
          mode: "MCQ",
          question_pool: "STANDARD",
          mcq_requested: 20,
          cq_requested: 0,
          attempt_status: "IN_PROGRESS",
          created_at: "2026-07-29T00:00:00.000Z",
          submitted_at: null,
        },
        totals: { mcq_total: 20, cq_total: 0 },
      })
    ).toMatchObject({ session: { id: 42, question_pool: "STANDARD" } })
    expect(() =>
      parsePracticeSummaryResponse({
        practice_session_id: 42,
        exam_type_id: 1,
        subject_id: 2,
        mode: "MCQ",
        attempt_status: "IN_PROGRESS",
      })
    ).toThrow(ApiContractError)
  })

  it("enforces contract access combinations for results and Weak Areas", () => {
    const result = {
      practice_session_id: 42,
      section: "MCQ",
      page: 1,
      page_size: 10,
      total_in_section: 0,
      explanation_access: {
        unlocked: false,
        required_plan: "pro",
        message: "Upgrade to Beta Pro to unlock explanations and revision.",
      },
      items: [],
    }
    expect(parseResultsResponse(result)).toEqual(result)
    expect(() =>
      parseResultsResponse({
        ...result,
        explanation_access: { unlocked: false, required_plan: null, message: null },
      })
    ).toThrow(ApiContractError)

    const dashboard = {
      message: null,
      proficiency: { score: 65, trend_vs_last_week: 4 },
      weak_areas_access: {
        unlocked: false,
        required_plan: "pro",
        minimum_attempts: 5,
        threshold_met: null,
        message: "Upgrade to Beta Pro to unlock Weak Areas",
      },
      weakness_ranking: [],
      recommendation: null,
    }
    expect(parseProgressDashboardResponse(dashboard)).toEqual(dashboard)
    expect(() =>
      parseProgressDashboardResponse({
        ...dashboard,
        weak_areas_access: {
          ...dashboard.weak_areas_access,
          threshold_met: false,
        },
      })
    ).toThrow(ApiContractError)

    const belowThresholdDashboard = {
      ...dashboard,
      message: "Not enough data yet",
      proficiency: null,
      weak_areas_access: {
        unlocked: false,
        required_plan: null,
        minimum_attempts: 5,
        threshold_met: false,
        message: "Complete at least 5 questions in a chapter to unlock Weak Areas",
      },
    }
    expect(parseProgressDashboardResponse(belowThresholdDashboard)).toEqual(belowThresholdDashboard)

    const qualifiedDashboard = {
      ...dashboard,
      weak_areas_access: {
        unlocked: true,
        required_plan: null,
        minimum_attempts: 5,
        threshold_met: true,
        message: null,
      },
      recommendation: {
        label: "Recommended practice",
        generate_payload: {
          exam_type_id: 1,
          subject_id: 2,
          mode: "MCQ",
          question_pool: "STANDARD",
          mcq_count: 10,
          language: "en",
          selection: { type: "CHAPTERS", chapter_ids: [7] },
        },
      },
    }
    expect(parseProgressDashboardResponse(qualifiedDashboard)).toEqual(qualifiedDashboard)
    expect(() =>
      parseProgressDashboardResponse({
        ...qualifiedDashboard,
        proficiency: { score: 101, trend_vs_last_week: 4 },
      })
    ).toThrow(ApiContractError)
    expect(() =>
      parseProgressDashboardResponse({
        ...qualifiedDashboard,
        recommendation: {
          ...qualifiedDashboard.recommendation,
          generate_payload: {
            ...qualifiedDashboard.recommendation.generate_payload,
            mode: "CQ",
          },
        },
      })
    ).toThrow(ApiContractError)
  })

  it("requires Board source badges without accepting undocumented question fields", () => {
    const list = {
      questions: [{
        id: 9001,
        exam_type_id: 1,
        subject_id: 2,
        chapter_id: 7,
        question_type: "MCQ",
        stem_text: "2 + 2 = ?",
        difficulty: 1,
        source: "Dhaka Board 2025",
        source_badge: "Dhaka Board · 2025",
        language: "en",
        created_at: "2026-07-29T00:00:00.000Z",
      }],
    }
    expect(parseQuestionsListResponse(list)).toEqual(list)
    const missingBadge = { ...list.questions[0] } as Record<string, unknown>
    delete missingBadge.source_badge
    expect(() => parseQuestionsListResponse({ questions: [missingBadge] })).toThrow(ApiContractError)
    expect(() =>
      parseQuestionsListResponse({
        questions: [{ ...list.questions[0], board: "Dhaka" }],
      })
    ).toThrow(ApiContractError)
  })

  it("accepts prompt-only CQ detail parts and rejects removed review references", () => {
    const detail = {
      question: {
        id: 9002,
        exam_type_id: 1,
        subject_id: 2,
        chapter_id: 7,
        question_type: "CQ",
        stem_text: "Explain refraction.",
        difficulty: 2,
        source: null,
        source_badge: null,
        language: "en",
        status: "PUBLISHED",
        created_at: "2026-07-29T00:00:00.000Z",
        updated_at: "2026-07-29T00:00:00.000Z",
      },
      options: [],
      parts: [{
        id: 10,
        question_id: 9002,
        label: "a",
        order_no: 1,
        prompt_text: "Define refraction.",
        marks: 2,
      }],
      media: [],
    }

    expect(parseQuestionDetailResponse(detail)).toEqual(detail)
    expect(() =>
      parseQuestionDetailResponse({
        ...detail,
        parts: [{ ...detail.parts[0], reference_text: "Internal review content" }],
      })
    ).toThrow(ApiContractError)
  })
})
