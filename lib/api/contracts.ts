import { z } from "zod"
import { ApiClientError, ApiContractError } from "./client"
import { questionReportReasonOptions } from "./types"
import type {
  ContactSubmitRequest,
  AuthMeResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
  PracticeGenerateRequest,
  QuestionReportRequest,
  QuestionsListRequest,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  UpgradeToProResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./types"

export const entitlementErrorMessages = {
  freeModeBlocked: "Free plan supports only MCQ mode. Upgrade to pro to use CQ or MIXED.",
  dailyLimitReached: "Daily practice session limit reached for free plan. Upgrade to pro for unlimited sessions.",
  subjectProRequired: "This subject requires pro plan for practice. Upgrade to pro to continue.",
  trialGraceExpiredDowngraded:
    "Trial ended and grace period expired. Your plan is now free. Upgrade to pro to continue.",
} as const

export type EntitlementErrorType = keyof typeof entitlementErrorMessages

const registerRequestSchema = z
  .object({
    email: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    fullName: z.string().min(1),
    school: z.string().min(1),
    city: z.string().min(1),
    studentClass: z.number().int(),
  })
  .strict()

const loginRequestSchema = z
  .object({
    email: z.string().min(1),
    password: z.string().min(1),
  })
  .strict()

const verifyEmailRequestSchema = z
  .object({
    token: z.string().min(1),
  })
  .strict()

const resendVerificationRequestSchema = z
  .object({
    email: z.string().min(1),
  })
  .strict()

const contactSubmitRequestSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().min(1),
    message: z.string().min(1),
  })
  .strict()

const questionsListRequestSchema = z
  .object({
    exam_type_id: z.number().int(),
    subject_id: z.number().int(),
    chapter_id: z.number().int().optional(),
    question_type: z.string().optional(),
    language: z.string().optional(),
  })
  .strict()

const questionReportReasonCodes = questionReportReasonOptions.map((option) => option.value) as [
  QuestionReportRequest["reason_code"],
  ...QuestionReportRequest["reason_code"][],
]

const questionReportRequestSchema = z
  .object({
    reason_code: z.enum(questionReportReasonCodes),
    details: z.string().max(1000).optional(),
  })
  .strict()

const practiceGenerateRequestSchema = z
  .object({
    exam_type_id: z.number().int(),
    subject_id: z.number().int(),
    mode: z.enum(["MCQ", "CQ", "MIXED"]),
    selection: z
      .object({
        type: z.enum(["CHAPTERS", "FULL_SYLLABUS", "BOOKMARKED"]),
        chapter_ids: z.array(z.number().int()).min(1).optional(),
      })
      .strict(),
    mcq_count: z.number().int().optional(),
    mcqCount: z.number().int().optional(),
    mcq_requested: z.number().int().optional(),
    cq_count: z.number().int().optional(),
    cqCount: z.number().int().optional(),
    cq_requested: z.number().int().optional(),
    language: z.string().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.selection.type === "CHAPTERS" && !value.selection.chapter_ids?.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selection", "chapter_ids"],
        message: "selection.chapter_ids is required when selection.type is CHAPTERS",
      })
    }

    if (value.selection.type !== "BOOKMARKED") return

    if (value.mode !== "MCQ") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mode"],
        message: "BOOKMARKED selection supports only MCQ mode",
      })
    }

    if (value.selection.chapter_ids !== undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selection", "chapter_ids"],
        message: "selection.chapter_ids is not allowed for BOOKMARKED selection",
      })
    }

    for (const field of ["mcq_count", "mcqCount", "mcq_requested", "cq_count", "cqCount", "cq_requested", "language"] as const) {
      if (value[field] !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${field} is not allowed for BOOKMARKED selection`,
        })
      }
    }
  })

const authUserSchema: z.ZodType<AuthUser> = z
  .object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.string(),
    plan_tier: z.enum(["free", "pro"]),
    school: z.string().nullable(),
    city: z.string().nullable(),
    student_class: z.number().int().nullable(),
    email_verified_at: z.string().nullable(),
    last_login_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .strict()

const messageResponseSchema = z.object({ message: z.string().min(1) }).strict()
const registerResponseSchema: z.ZodType<RegisterResponse> = messageResponseSchema
const verifyEmailResponseSchema: z.ZodType<VerifyEmailResponse> = messageResponseSchema
const resendVerificationResponseSchema: z.ZodType<ResendVerificationResponse> = messageResponseSchema
const loginResponseSchema: z.ZodType<LoginResponse> = z
  .object({ user: authUserSchema, token: z.string().min(1) })
  .strict()
const authMeResponseSchema: z.ZodType<AuthMeResponse> = z
  .object({ user: authUserSchema })
  .strict()
const upgradeToProResponseSchema: z.ZodType<UpgradeToProResponse> = z
  .object({ message: z.string().min(1), plan_tier: z.literal("pro") })
  .strict()

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request payload"
}

export function validateRegisterRequest(input: RegisterRequest): RegisterRequest {
  const parsed = registerRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateLoginRequest(input: LoginRequest): LoginRequest {
  const parsed = loginRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateVerifyEmailRequest(input: VerifyEmailRequest): VerifyEmailRequest {
  const parsed = verifyEmailRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateResendVerificationRequest(
  input: ResendVerificationRequest
): ResendVerificationRequest {
  const parsed = resendVerificationRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateContactSubmitRequest(input: ContactSubmitRequest): ContactSubmitRequest {
  const parsed = contactSubmitRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateQuestionsListRequest(input: QuestionsListRequest): QuestionsListRequest {
  const parsed = questionsListRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validateQuestionReportRequest(
  input: QuestionReportRequest
): QuestionReportRequest {
  const parsed = questionReportRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }
  return parsed.data
}

export function validatePracticeGenerateRequest(
  input: PracticeGenerateRequest
): PracticeGenerateRequest {
  const parsed = practiceGenerateRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }

  return parsed.data
}

function parseResponse<T>(schema: z.ZodType<T>, input: unknown, contractName: string): T {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiContractError(`Invalid ${contractName} response`, { cause: parsed.error })
  }
  return parsed.data
}

export const parseRegisterResponse = (input: unknown) =>
  parseResponse(registerResponseSchema, input, "registration")

export const parseLoginResponse = (input: unknown) =>
  parseResponse(loginResponseSchema, input, "login")

export const parseAuthMeResponse = (input: unknown) =>
  parseResponse(authMeResponseSchema, input, "account")

export const parseVerifyEmailResponse = (input: unknown) =>
  parseResponse(verifyEmailResponseSchema, input, "email verification")

export const parseResendVerificationResponse = (input: unknown) =>
  parseResponse(resendVerificationResponseSchema, input, "resend verification")

export const parseUpgradeToProResponse = (input: unknown) =>
  parseResponse(upgradeToProResponseSchema, input, "Beta Pro activation")

export function matchEntitlementErrorByExactMessage(
  error: unknown
): { type: EntitlementErrorType; message: string } | null {
  if (!(error instanceof ApiClientError) || error.status !== 403) {
    return null
  }

  for (const [type, message] of Object.entries(entitlementErrorMessages) as [
    EntitlementErrorType,
    string,
  ][]) {
    if (error.message === message) {
      return { type, message }
    }
  }

  return null
}

export function isUnverifiedLoginError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 403 && error.message === "Email verification required"
}
