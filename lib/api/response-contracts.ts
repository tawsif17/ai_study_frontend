import { z } from "zod"
import { ApiContractError } from "./client"
import type {
  GetAnswersResponse,
  QuestionsListResponse,
  PracticeGenerateResponse,
  PracticeItemsResponse,
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
const questionPoolSchema = z.enum(["STANDARD", "BOARD_ONLY"])
const sectionSchema = z.enum(["MCQ", "CQ"])
const attemptStatusSchema = z.enum(["IN_PROGRESS", "SUBMITTED"])

const practiceGenerateResponseSchema: z.ZodType<PracticeGenerateResponse> = z
  .object({
    practice_session_id: z.number().int(),
    mcq_total: z.number().int().nonnegative(),
    cq_total: z.number().int().nonnegative(),
    warning: z
      .object({ code: z.string(), message: z.string() })
      .strict()
      .optional(),
  })
  .strict()

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

const recommendationSelectionSchema = z
  .object({
    type: z.literal("CHAPTERS"),
    chapter_ids: z.array(z.number().int()).min(1).optional(),
  })
  .strict()

const weakAreasAccessSchema = z
  .object({
    unlocked: z.boolean(),
    required_plan: z.enum(["pro"]).nullable(),
    minimum_attempts: z.literal(5),
    threshold_met: z.boolean().nullable(),
    message: z.string().nullable(),
  })
  .strict()
  .superRefine((access, context) => {
    const isPlanLocked =
      !access.unlocked && access.required_plan === "pro" && access.threshold_met === null
    const isBelowThreshold =
      !access.unlocked && access.required_plan === null && access.threshold_met === false
    const isUnlocked =
      access.unlocked && access.required_plan === null && access.threshold_met === true

    if (!isPlanLocked && !isBelowThreshold && !isUnlocked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weak Areas access metadata contains an inconsistent entitlement state",
      })
    }
  })

const progressDashboardResponseSchema: z.ZodType<ProgressDashboardResponse> = z
  .object({
    message: z.string().nullable(),
    proficiency: z
      .object({
        score: z.number().int().min(0).max(100),
        trend_vs_last_week: z.number().int().nullable(),
      })
      .strict()
      .nullable(),
    weak_areas_access: weakAreasAccessSchema,
    weakness_ranking: z.array(
      z
        .object({
          subject_id: z.number().int(),
          subject_name: z.string(),
          chapter_id: z.number().int(),
          chapter_name: z.string(),
          accuracy: z.number().int().min(0).max(100),
          questions_attempted: z.number().int().nonnegative(),
          message: z.string().nullable(),
        })
        .strict()
    ),
    recommendation: z
      .object({
        label: z.string(),
        generate_payload: z
          .object({
            exam_type_id: z.number().int(),
            subject_id: z.number().int(),
            mode: z.literal("MCQ"),
            question_pool: z.literal("STANDARD"),
            mcq_count: z.number().int().min(1).optional(),
            language: z.string().optional(),
            selection: recommendationSelectionSchema,
          })
          .strict(),
      })
      .strict()
      .nullable(),
  })
  .strict()

const nestedPracticeSummaryResponseSchema = z
  .object({
    session: z
      .object({
        id: z.number().int(),
        user_id: z.string(),
        exam_type_id: z.number().int(),
        subject_id: z.number().int(),
        selection_mode: z.string(),
        syllabus_version_id: z.string().nullable(),
        mode: practiceModeSchema,
        question_pool: questionPoolSchema,
        mcq_requested: z.number().int(),
        cq_requested: z.number().int(),
        attempt_status: attemptStatusSchema,
        created_at: z.string(),
        submitted_at: z.string().nullable(),
      })
      .strict(),
    totals: z
      .object({
        mcq_total: z.number().int().nonnegative(),
        cq_total: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict()

export type RawPracticeSummaryResponse = z.infer<typeof nestedPracticeSummaryResponseSchema>

const practiceItemSchema = z
  .object({
    section_order_no: z.number().int().positive(),
    order_no: z.number().int().positive(),
    practice_item_id: z.number().int(),
    question_id: z.number().int(),
    section: sectionSchema,
  })
  .strict()

const practiceItemsResponseSchema: z.ZodType<PracticeItemsResponse> = z
  .object({
    practice_session_id: z.number().int(),
    section: sectionSchema,
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_in_section: z.number().int().nonnegative(),
    items: z.array(practiceItemSchema),
  })
  .strict()

const saveAnswersResponseSchema: z.ZodType<SaveAnswersResponse> = z
  .object({ saved: z.literal(true) })
  .strict()

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
        .strict()
    ),
  })
  .strict()

const submitResponseSchema: z.ZodType<SubmitResponse> = z
  .object({
    practice_session_id: z.number().int(),
    mcq_total: z.number().int().nonnegative(),
    mcq_correct: z.number().int().nonnegative(),
    mcq_score: z.number().int(),
  })
  .strict()

const questionListItemSchema = z
  .object({
    id: z.number().int(),
    exam_type_id: z.number().int(),
    subject_id: z.number().int(),
    chapter_id: z.number().int().nullable(),
    question_type: z.string(),
    stem_text: z.string().nullable(),
    difficulty: z.number().int().nullable(),
    source: z.string().nullable(),
    source_badge: z.string().nullable(),
    language: z.string(),
    created_at: z.string(),
  })
  .strict()

const questionsListResponseSchema: z.ZodType<QuestionsListResponse> = z
  .object({ questions: z.array(questionListItemSchema) })
  .strict()

const questionDetailResponseSchema = z
  .object({
    question: z
      .object({
        id: z.number().int(),
        exam_type_id: z.number().int(),
        subject_id: z.number().int(),
        chapter_id: z.number().int().nullable(),
        question_type: z.string(),
        stem_text: z.string().nullable(),
        difficulty: z.number().int().nullable(),
        source: z.string().nullable(),
        source_badge: z.string().nullable(),
        language: z.string(),
        status: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      })
      .strict(),
    options: z.array(
      z
        .object({
          id: z.number().int(),
          question_id: z.number().int(),
          label: z.string(),
          option_text: z.string(),
        })
        .strict()
    ),
    parts: z.array(
      z
        .object({
          id: z.number().int(),
          question_id: z.number().int(),
          label: z.string(),
          order_no: z.number().int(),
          prompt_text: z.string(),
          marks: z.number(),
        })
        .strict()
    ),
    media: z.array(
      z
        .object({
          link_id: z.number().int(),
          question_id: z.number().int(),
          question_part_id: z.number().int().nullable(),
          option_id: z.number().int().nullable(),
          caption: z.string().nullable(),
          linked_at: z.string(),
          public_url: z.string().nullable(),
          media_type: z.string(),
          mime_type: z.string().nullable(),
        })
        .strict()
    ),
  })
  .strict()

export type RawQuestionDetailResponse = z.infer<typeof questionDetailResponseSchema>

const explanationAccessSchema = z
  .object({
    unlocked: z.boolean(),
    required_plan: z.enum(["pro"]).nullable(),
    message: z.string().nullable(),
  })
  .strict()
  .superRefine((access, context) => {
    if (!access.unlocked && access.required_plan !== "pro") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Locked explanations must require pro",
      })
    }
    if (access.unlocked && access.required_plan !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unlocked explanations must not require a plan",
      })
    }
  })

const resultMediaSchema = z
  .object({
    question_part_id: z.number().int().nullable(),
    option_id: z.number().int().nullable(),
    caption: z.string().nullable(),
    asset: z
      .object({
        id: z.string(),
        media_type: z.string(),
        public_url: z.string().nullable(),
        storage_url: z.string().nullable(),
        mime_type: z.string().nullable(),
      })
      .strict(),
  })
  .strict()

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
        difficulty: z.number().int().nullable(),
        source: z.string().nullable(),
        source_badge: z.string().nullable(),
        language: z.string(),
      })
      .strict(),
    user_answer: z
      .object({
        selected_option_label: z.string().nullable().optional(),
        cq_text: z.string().nullable().optional(),
      })
      .strict(),
    mcq: z
      .object({
        correct_option_label: z.string().nullable(),
        is_correct: z.boolean().nullable(),
        options: z.array(
          z.object({ label: z.string(), option_text: z.string() }).strict()
        ),
      })
      .strict()
      .optional(),
    cq: z
      .object({
        parts: z.array(
          z
            .object({
              part_id: z.number().int(),
              label: z.string(),
              order_no: z.number().int(),
              prompt_text: z.string(),
              marks: z.number(),
              sample_answer: z.string().nullable(),
              explanation: z.string().nullable(),
              reference_text: z.string().nullable(),
            })
            .strict()
        ),
      })
      .strict()
      .optional(),
    media: z.array(resultMediaSchema),
  })
  .strict()

const resultsResponseSchema: z.ZodType<ResultsResponse> = z
  .object({
    practice_session_id: z.number().int(),
    section: sectionSchema,
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_in_section: z.number().int().nonnegative(),
    explanation_access: explanationAccessSchema,
    items: z.array(resultItemSchema),
  })
  .strict()

const resultsJumpResponseSchema: z.ZodType<ResultsJumpResponse> = z
  .object({ explanation_access: explanationAccessSchema, item: resultItemSchema })
  .strict()

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
  parseResponse(nestedPracticeSummaryResponseSchema, input, "practice summary")
export const parsePracticeItemsResponse = (input: unknown) =>
  parseResponse(practiceItemsResponseSchema, input, "practice items")
export const parseSaveAnswersResponse = (input: unknown) =>
  parseResponse(saveAnswersResponseSchema, input, "answer save")
export const parseGetAnswersResponse = (input: unknown) =>
  parseResponse(getAnswersResponseSchema, input, "saved answers")
export const parseSubmitResponse = (input: unknown) =>
  parseResponse(submitResponseSchema, input, "practice submission")
export const parseQuestionsListResponse = (input: unknown) =>
  parseResponse(questionsListResponseSchema, input, "question list")
export const parseQuestionDetailResponse = (input: unknown): RawQuestionDetailResponse =>
  parseResponse(questionDetailResponseSchema, input, "question detail")
export const parseResultsResponse = (input: unknown) =>
  parseResponse(resultsResponseSchema, input, "practice results")
export const parseResultsJumpResponse = (input: unknown) =>
  parseResponse(resultsJumpResponseSchema, input, "result jump")
