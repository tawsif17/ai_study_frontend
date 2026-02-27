import { z } from "zod"
import { ApiClientError } from "./client"
import type {
  ContactSubmitRequest,
  LoginRequest,
  PracticeGenerateRequest,
  QuestionsListRequest,
  RegisterRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
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
    password: z.string().min(1),
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

const practiceGenerateRequestSchema = z
  .object({
    exam_type_id: z.number().int(),
    subject_id: z.number().int(),
    mode: z.enum(["MCQ", "CQ", "MIXED"]),
    selection: z
      .object({
        type: z.enum(["CHAPTERS", "FULL_SYLLABUS"]),
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

export function validatePracticeGenerateRequest(
  input: PracticeGenerateRequest
): PracticeGenerateRequest {
  const parsed = practiceGenerateRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(zodMessage(parsed.error))
  }

  if (parsed.data.selection.type === "CHAPTERS" && !parsed.data.selection.chapter_ids?.length) {
    throw new Error("selection.chapter_ids is required when selection.type is CHAPTERS")
  }

  return parsed.data
}

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
  return error instanceof ApiClientError && error.status === 401 && error.message === "Email verification required"
}
