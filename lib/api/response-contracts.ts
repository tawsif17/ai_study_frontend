import { z } from "zod"
import { ApiContractError } from "./client"
import type {
  GetAnswersResponse,
  PracticeGenerateResponse,
  PracticeItemsResponse,
  PracticeSummaryResponse,
  ProgressDashboardResponse,
  RemoveBookmarkResponse,
  ResultsJumpResponse,
  ResultsResponse,
  RevisionListKind,
  RevisionListResponse,
  RevisionSummaryResponse,
  SaveAnswersResponse,
  SaveBookmarkResponse,
  SubmitResponse,
} from "./types"

const practiceModeSchema = z.enum(["MCQ", "CQ", "MIXED"])
const sectionSchema = z.enum(["MCQ", "CQ"])
const attemptStatusSchema = z.enum(["IN_PROGRESS", "SUBMITTED"])

const practiceGenerateResponseSchema: z.ZodType<PracticeGenerateResponse> = z
  .object({
    practice_session_id: z.number().int(),
    mcq_total: z.number().int().nonnegative(),
    cq_total: z.number().int().nonnegative(),
    warning: z
      .object({ code: z.string(), message: z.string() })
      .passthrough()
      .optional(),
  })
  .passthrough()

const revisionMediaSchema = z
  .object({
    link_id: z.number().int(),
    question_part_id: z.number().int().nullable(),
    option_id: z.number().int().nullable(),
    caption: z.string().nullable(),
    public_url: z.string().nullable(),
    media_type: z.string(),
    mime_type: z.string().nullable(),
  })
  .strict()

const revisionItemSchema = z
  .object({
    question_id: z.number().int(),
    stem_text: z.string().nullable(),
    explanation: z.string().nullable(),
    source: z.string().nullable(),
    language: z.string(),
    correct_answer: z
      .object({ label: z.string(), option_text: z.string() })
      .strict(),
    subject: z.object({ id: z.number().int(), name: z.string() }).strict(),
    chapter: z.object({ id: z.number().int(), name: z.string() }).strict().nullable(),
    media: z.array(revisionMediaSchema),
    bookmarked_at: z.string().optional(),
    last_mistaken_at: z.string().optional(),
  })
  .strict()

const bookmarkRevisionListResponseSchema: z.ZodType<RevisionListResponse> = z
  .object({
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    items: z.array(revisionItemSchema.extend({ bookmarked_at: z.string() }).strict()),
  })
  .strict()

const mistakeRevisionListResponseSchema: z.ZodType<RevisionListResponse> = z
  .object({
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    items: z.array(revisionItemSchema.extend({ last_mistaken_at: z.string() }).strict()),
  })
  .strict()

const revisionSummarySubjectSchema = z
  .object({
    subject_id: z.number().int(),
    subject_name: z.string(),
    bookmark_count: z.number().int().nonnegative(),
    active_mistake_count: z.number().int().nonnegative(),
    saved_question_count: z.number().int().nonnegative(),
  })
  .strict()

const revisionSummaryResponseSchema: z.ZodType<RevisionSummaryResponse> = z
  .object({
    bookmark_total: z.number().int().nonnegative(),
    active_mistake_total: z.number().int().nonnegative(),
    saved_question_total: z.number().int().nonnegative(),
    subjects: z.array(revisionSummarySubjectSchema),
  })
  .strict()

const saveBookmarkResponseSchema: z.ZodType<SaveBookmarkResponse> = z
  .object({
    question_id: z.number().int(),
    bookmarked: z.literal(true),
    bookmarked_at: z.string(),
  })
  .strict()

const removeBookmarkResponseSchema: z.ZodType<RemoveBookmarkResponse> = z
  .object({
    question_id: z.number().int(),
    bookmarked: z.literal(false),
  })
  .strict()

const practiceSelectionSchema = z
  .object({
    type: z.enum(["CHAPTERS", "FULL_SYLLABUS", "BOOKMARKED"]),
    chapter_ids: z.array(z.number().int()).optional(),
  })
  .passthrough()

const progressDashboardResponseSchema: z.ZodType<ProgressDashboardResponse> = z
  .object({
    message: z.string().nullable(),
    proficiency: z
      .object({
        score: z.number(),
        trend_vs_last_week: z.number().nullable(),
      })
      .passthrough()
      .nullable(),
    weakness_ranking: z.array(
      z
        .object({
          subject_id: z.number().int(),
          subject_name: z.string(),
          chapter_id: z.number().int(),
          chapter_name: z.string(),
          accuracy: z.number(),
          questions_attempted: z.number().int().nonnegative(),
          message: z.string().nullable(),
        })
        .passthrough()
    ),
    recommendation: z
      .object({
        label: z.string(),
        generate_payload: z
          .object({
            exam_type_id: z.number().int(),
            subject_id: z.number().int(),
            mode: practiceModeSchema,
            selection: practiceSelectionSchema,
          })
          .passthrough(),
      })
      .passthrough()
      .nullable(),
  })
  .passthrough()

const practiceSummaryResponseSchema: z.ZodType<PracticeSummaryResponse> = z
  .object({
    practice_session_id: z.number().int(),
    exam_type_id: z.number().int(),
    subject_id: z.number().int(),
    mode: practiceModeSchema,
    attempt_status: attemptStatusSchema,
    mcq_total: z.number().int().nonnegative().optional(),
    cq_total: z.number().int().nonnegative().optional(),
  })
  .passthrough()

const nestedPracticeSummaryResponseSchema = z
  .object({
    session: z
      .object({
        id: z.number().int(),
        exam_type_id: z.number().int(),
        subject_id: z.number().int(),
        mode: practiceModeSchema,
        attempt_status: attemptStatusSchema,
      })
      .passthrough(),
    totals: z
      .object({
        mcq_total: z.number().int().nonnegative().optional(),
        cq_total: z.number().int().nonnegative().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export type RawPracticeSummaryResponse =
  | PracticeSummaryResponse
  | z.infer<typeof nestedPracticeSummaryResponseSchema>

const practiceItemSchema = z
  .object({
    section_order_no: z.number().int().positive(),
    order_no: z.number().int().positive(),
    practice_item_id: z.number().int(),
    question_id: z.number().int(),
  })
  .passthrough()

const practiceItemsResponseSchema: z.ZodType<PracticeItemsResponse> = z
  .object({
    practice_session_id: z.number().int(),
    section: sectionSchema,
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_in_section: z.number().int().nonnegative(),
    items: z.array(practiceItemSchema),
  })
  .passthrough()

const saveAnswersResponseSchema: z.ZodType<SaveAnswersResponse> = z
  .object({ saved: z.boolean() })
  .passthrough()

const getAnswersResponseSchema: z.ZodType<GetAnswersResponse> = z
  .object({
    answers: z.array(
      z
        .object({
          practice_item_id: z.number().int(),
          answer_type: z.enum(["MCQ", "CQ"]),
          selected_option_label: z.string().nullable(),
          cq_text: z.string().nullable(),
          updated_at: z.string(),
        })
        .passthrough()
    ),
  })
  .passthrough()

const submitResponseSchema: z.ZodType<SubmitResponse> = z
  .object({
    practice_session_id: z.number().int(),
    mcq_total: z.number().int().nonnegative(),
    mcq_correct: z.number().int().nonnegative(),
    mcq_score: z.number(),
  })
  .passthrough()

const resultItemSchema = z
  .object({
    section_order_no: z.number().int().positive(),
    order_no: z.number().int().positive(),
    practice_item_id: z.number().int(),
    question: z
      .object({
        id: z.number().int(),
        question_type: z.enum(["MCQ", "CQ"]),
        stem_text: z.string().nullable(),
        explanation: z.string().nullable(),
        difficulty: z.number().nullable(),
        source: z.string().nullable(),
        language: z.enum(["bn", "en"]),
      })
      .passthrough(),
    user_answer: z
      .object({
        selected_option_label: z.string().nullable().optional(),
        cq_text: z.string().nullable().optional(),
      })
      .passthrough(),
    mcq: z
      .object({
        correct_option_label: z.string().nullable(),
        is_correct: z.boolean().nullable(),
        options: z.array(
          z.object({ label: z.string(), option_text: z.string() }).passthrough()
        ),
      })
      .passthrough()
      .optional(),
    media: z.array(z.unknown()),
  })
  .passthrough()

const resultsResponseSchema: z.ZodType<ResultsResponse> = z
  .object({
    practice_session_id: z.number().int(),
    section: sectionSchema,
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_in_section: z.number().int().nonnegative(),
    items: z.array(resultItemSchema),
  })
  .passthrough()

const resultsJumpResponseSchema: z.ZodType<ResultsJumpResponse> = z
  .object({ item: resultItemSchema })
  .passthrough()

function parseResponse<T>(schema: z.ZodType<T>, input: unknown, name: string): T {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiContractError(`Invalid ${name} response`, { cause: parsed.error })
  }
  return parsed.data
}

export const parsePracticeGenerateResponse = (input: unknown) =>
  parseResponse(practiceGenerateResponseSchema, input, "practice generation")
export const parseRevisionListResponse = (input: unknown, kind: RevisionListKind) =>
  parseResponse(
    kind === "bookmarks"
      ? bookmarkRevisionListResponseSchema
      : mistakeRevisionListResponseSchema,
    input,
    `${kind} revision list`
  )
export const parseRevisionSummaryResponse = (input: unknown) =>
  parseResponse(revisionSummaryResponseSchema, input, "revision summary")
export const parseSaveBookmarkResponse = (input: unknown) =>
  parseResponse(saveBookmarkResponseSchema, input, "bookmark save")
export const parseRemoveBookmarkResponse = (input: unknown) =>
  parseResponse(removeBookmarkResponseSchema, input, "bookmark removal")
export const parseProgressDashboardResponse = (input: unknown) =>
  parseResponse(progressDashboardResponseSchema, input, "progress dashboard")
export const parsePracticeSummaryResponse = (input: unknown): RawPracticeSummaryResponse =>
  parseResponse(
    z.union([practiceSummaryResponseSchema, nestedPracticeSummaryResponseSchema]),
    input,
    "practice summary"
  )
export const parsePracticeItemsResponse = (input: unknown) =>
  parseResponse(practiceItemsResponseSchema, input, "practice items")
export const parseSaveAnswersResponse = (input: unknown) =>
  parseResponse(saveAnswersResponseSchema, input, "answer save")
export const parseGetAnswersResponse = (input: unknown) =>
  parseResponse(getAnswersResponseSchema, input, "saved answers")
export const parseSubmitResponse = (input: unknown) =>
  parseResponse(submitResponseSchema, input, "practice submission")
export const parseResultsResponse = (input: unknown) =>
  parseResponse(resultsResponseSchema, input, "practice results")
export const parseResultsJumpResponse = (input: unknown) =>
  parseResponse(resultsJumpResponseSchema, input, "result jump")
