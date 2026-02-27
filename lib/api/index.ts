/**
 * API Layer - Backend calls aligned with project_docs/CONTRACTS/api.md
 */

export * from "./types"
export * from "./client"
export * from "./contracts"

import { apiClient } from "./client"
import {
  validateContactSubmitRequest,
  validateLoginRequest,
  validatePracticeGenerateRequest,
  validateQuestionsListRequest,
  validateRegisterRequest,
  validateResendVerificationRequest,
  validateVerifyEmailRequest,
} from "./contracts"
import type {
  AuthMeResponse,
  Chapter,
  ChaptersResponse,
  ContactSubmitRequest,
  ContactSubmitResponse,
  ExamType,
  GetAnswersResponse,
  LoginRequest,
  LoginResponse,
  McqOption,
  PracticeGenerateRequest,
  PracticeGenerateResponse,
  PracticeItem,
  PracticeMode,
  PracticeSummaryResponse,
  QuestionDetail,
  QuestionPart,
  QuestionsListRequest,
  QuestionsListResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  UpgradeToProResponse,
  ResultsJumpResponse,
  ResultsResponse,
  SaveAnswersRequest,
  SaveAnswersResponse,
  Section,
  Subject,
  SubjectsResponse,
  SubmitResponse,
  AttemptStatus,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./types"

// ============================================
// AUTH API
// ============================================

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const payload = validateRegisterRequest({
    email: data.email,
    password: data.password,
    fullName: data.fullName.trim(),
    school: data.school,
    city: data.city,
    studentClass: data.studentClass,
  })

  return apiClient<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  })
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const payload = validateLoginRequest(data)
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  })
}

export async function getAuthMe(): Promise<AuthMeResponse> {
  return apiClient<AuthMeResponse>("/auth/me", {
    requiresAuth: true,
  })
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const payload = validateVerifyEmailRequest(data)
  return apiClient<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: payload,
  })
}

export async function resendVerification(
  data: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  const payload = validateResendVerificationRequest(data)
  return apiClient<ResendVerificationResponse>("/auth/resend-verification", {
    method: "POST",
    body: payload,
  })
}

export async function upgradeToPro(): Promise<UpgradeToProResponse> {
  return apiClient<UpgradeToProResponse>("/auth/upgrade-to-pro", {
    method: "POST",
    body: {},
    requiresAuth: true,
  })
}

export async function submitContact(
  data: ContactSubmitRequest
): Promise<ContactSubmitResponse> {
  const payload = validateContactSubmitRequest({
    name: data.name.trim(),
    email: data.email.trim(),
    message: data.message.trim(),
  })

  return apiClient<ContactSubmitResponse>("/contact", {
    method: "POST",
    body: payload,
    includeAuth: true,
  })
}

// ============================================
// EXAM TYPES API
// ============================================

export async function getExamTypes(): Promise<ExamType[]> {
  return apiClient<ExamType[]>("/exam-types")
}

// ============================================
// SUBJECTS API
// ============================================

export async function getSubjects(examType?: string): Promise<Subject[]> {
  const response = await apiClient<SubjectsResponse>("/subjects", {
    params: examType ? { exam_type: examType } : undefined,
    requiresAuth: true,
  })
  return response.subjects
}

export async function getSubjectChapters(subjectId: number): Promise<Chapter[]> {
  const response = await apiClient<ChaptersResponse>(`/subjects/${subjectId}/chapters`)
  return response.chapters
}

// ============================================
// QUESTIONS API
// ============================================

export async function getQuestions(query: QuestionsListRequest): Promise<QuestionsListResponse> {
  const params = validateQuestionsListRequest(query)
  return apiClient<QuestionsListResponse>("/questions", {
    params,
    requiresAuth: true,
  })
}

export async function getQuestionById(questionId: number): Promise<QuestionDetail> {
  type QuestionDetailsEnvelope = {
    question: QuestionDetail
    options?: McqOption[]
    parts?: (QuestionPart & { marks: number | string })[]
    media?: unknown[]
  }
  const response = await apiClient<QuestionDetail | QuestionDetailsEnvelope>(`/questions/${questionId}`)

  if ("question" in response) {
    return {
      ...(response.question ?? {}),
      ...(response.options ? { options: response.options } : {}),
      ...(response.parts
        ? {
            parts: response.parts.map((part) => ({
              ...part,
              marks: typeof part.marks === "string" ? Number.parseFloat(part.marks) : part.marks,
            })),
          }
        : {}),
      ...(response.media ? { media: response.media } : {}),
    } as QuestionDetail
  }

  return response
}

// ============================================
// PRACTICE API
// ============================================

export async function generatePractice(
  data: PracticeGenerateRequest
): Promise<PracticeGenerateResponse> {
  const payload = validatePracticeGenerateRequest(data)

  return apiClient<PracticeGenerateResponse>("/practice/generate", {
    method: "POST",
    body: payload,
    requiresAuth: true,
  })
}

export async function getPracticeSummary(
  practiceId: number
): Promise<PracticeSummaryResponse> {
  const response = await apiClient<
    | PracticeSummaryResponse
    | {
        session: {
          id: number
          exam_type_id: number
          subject_id: number
          mode: PracticeMode
          attempt_status: AttemptStatus
        }
        totals?: { mcq_total?: number; cq_total?: number }
      }
  >(`/practice/${practiceId}/summary`, {
    requiresAuth: true,
  })

  if ("session" in response) {
    return {
      practice_session_id: response.session.id,
      exam_type_id: response.session.exam_type_id,
      subject_id: response.session.subject_id,
      mode: response.session.mode,
      attempt_status: response.session.attempt_status,
      mcq_total: response.totals?.mcq_total,
      cq_total: response.totals?.cq_total,
    }
  }

  return response
}

export async function getPracticeItems(
  practiceId: number,
  section?: Section
): Promise<PracticeItem[]> {
  const response = await apiClient<PracticeItem[] | { items: PracticeItem[] }>(`/practice/${practiceId}/items`, {
    params: section ? { section } : undefined,
    requiresAuth: true,
  })
  return Array.isArray(response) ? response : response.items
}

export async function saveAnswers(
  practiceId: number,
  data: SaveAnswersRequest
): Promise<SaveAnswersResponse> {
  return apiClient<SaveAnswersResponse>(`/practice/${practiceId}/answers`, {
    method: "PATCH",
    body: data,
    requiresAuth: true,
  })
}

export async function getAnswers(practiceId: number): Promise<GetAnswersResponse> {
  return apiClient<GetAnswersResponse>(`/practice/${practiceId}/answers`, {
    requiresAuth: true,
  })
}

export async function submitPractice(practiceId: number): Promise<SubmitResponse> {
  return apiClient<SubmitResponse>(`/practice/${practiceId}/submit`, {
    method: "POST",
    requiresAuth: true,
  })
}

export async function getResults(
  practiceId: number,
  section: Section,
  page: number = 1,
  pageSize: number = 10
): Promise<ResultsResponse> {
  return apiClient<ResultsResponse>(`/practice/${practiceId}/results`, {
    params: {
      section,
      page,
      page_size: pageSize,
    },
    requiresAuth: true,
  })
}

export async function jumpToResult(
  practiceId: number,
  section: Section,
  number: number
): Promise<ResultsJumpResponse> {
  return apiClient<ResultsJumpResponse>(`/practice/${practiceId}/results/jump`, {
    params: {
      section,
      number,
    },
    requiresAuth: true,
  })
}
