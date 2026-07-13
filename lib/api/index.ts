/**
 * API Layer - Backend calls aligned with project_docs/CONTRACTS/api.md
 */

export * from "./types"
export * from "./client"
export * from "./contracts"

import { apiClient, apiClientWithResponse } from "./client"
import {
  validateContactSubmitRequest,
  validateLoginRequest,
  validatePracticeGenerateRequest,
  validateQuestionReportRequest,
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
  CompleteResultsResponse,
  ExamType,
  GetAnswersResponse,
  LoginRequest,
  LoginResponse,
  McqOption,
  PracticeGenerateRequest,
  PracticeGenerateResponse,
  PracticeItemsResponse,
  ProgressDashboardResponse,
  PracticeItem,
  PracticeMode,
  PracticeSummaryResponse,
  QuestionDetail,
  QuestionPart,
  QuestionReportRequest,
  QuestionReportResponse,
  QuestionsListRequest,
  QuestionsListResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterResult,
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

export async function register(data: RegisterRequest): Promise<RegisterResult> {
  const payload = validateRegisterRequest({
    email: data.email,
    password: data.password,
    fullName: data.fullName.trim(),
    school: data.school,
    city: data.city,
    studentClass: data.studentClass,
  })

  const response = await apiClientWithResponse<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  })

  return {
    data: response.data,
    status: response.status === 202 ? 202 : 201,
  }
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
    params: {
      exam_type_id: params.exam_type_id,
      subject_id: params.subject_id,
      chapter_id: params.chapter_id,
      question_type: params.question_type,
      language: params.language,
    },
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

export async function reportQuestion(
  questionId: number,
  data: QuestionReportRequest
): Promise<QuestionReportResponse> {
  const trimmedDetails = data.details?.trim()
  const payload = validateQuestionReportRequest({
    reason_code: data.reason_code,
    ...(trimmedDetails ? { details: trimmedDetails } : {}),
  })

  return apiClient<QuestionReportResponse>(`/questions/${questionId}/reports`, {
    method: "POST",
    body: payload,
    requiresAuth: true,
  })
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

export async function getProgressDashboard(): Promise<ProgressDashboardResponse> {
  return apiClient<ProgressDashboardResponse>("/profile/progress-dashboard", {
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
  const pageSize = 20
  const getPage = (page: number) => apiClient<PracticeItemsResponse>(`/practice/${practiceId}/items`, {
    params: section ? { section, page, page_size: pageSize } : undefined,
    requiresAuth: true,
  })

  const firstResponse = await getPage(1)
  if (Array.isArray(firstResponse)) return normalizePracticeItems(firstResponse)

  const responsePageSize = Number.isInteger(firstResponse.page_size) && firstResponse.page_size > 0
    ? firstResponse.page_size
    : pageSize
  const totalPages = Math.max(1, Math.ceil(firstResponse.total_in_section / responsePageSize))
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => getPage(index + 2))
  )
  const items = [
    ...firstResponse.items,
    ...remainingPages.flatMap((response) => Array.isArray(response) ? response : response.items),
  ]

  return normalizePracticeItems(items)
}

function normalizePracticeItems(items: PracticeItem[]): PracticeItem[] {
  const uniqueItems = new Map<number, PracticeItem>()
  for (const item of items) {
    if (!uniqueItems.has(item.practice_item_id)) uniqueItems.set(item.practice_item_id, item)
  }
  return Array.from(uniqueItems.values()).sort(
    (left, right) => left.section_order_no - right.section_order_no || left.order_no - right.order_no
  )
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

export async function getCompleteResults(
  practiceId: number,
  section: Section = "MCQ"
): Promise<CompleteResultsResponse> {
  const pageSize = 20
  // The existing practice contract accepts at most 50 MCQs per session. Keep
  // this client-side check so malformed metadata cannot trigger unbounded
  // pagination before a learner sees a score.
  const maxMcqResults = 50
  const firstPage = await getResults(practiceId, section, 1, pageSize)

  if (
    firstPage.practice_session_id !== practiceId ||
    firstPage.section !== section ||
    firstPage.page !== 1 ||
    !Number.isSafeInteger(firstPage.total_in_section) ||
    firstPage.total_in_section < 0 ||
    firstPage.total_in_section > maxMcqResults ||
    !Number.isSafeInteger(firstPage.page_size) ||
    firstPage.page_size < 1 ||
    firstPage.page_size > pageSize
  ) {
    throw new Error("The complete results response is inconsistent. Please retry.")
  }

  const responsePageSize = firstPage.page_size
  const totalPages = Math.max(1, Math.ceil(firstPage.total_in_section / responsePageSize))
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getResults(practiceId, section, index + 2, pageSize)
    )
  )
  const pages = [firstPage, ...remainingPages]

  for (const [index, page] of pages.entries()) {
    if (
      page.practice_session_id !== firstPage.practice_session_id ||
      page.section !== firstPage.section ||
      page.total_in_section !== firstPage.total_in_section ||
      page.page !== index + 1
    ) {
      throw new Error("The complete results response is inconsistent. Please retry.")
    }
  }

  const items = pages
    .flatMap((page) => page.items)
    .sort((left, right) =>
      left.section_order_no - right.section_order_no || left.order_no - right.order_no
    )
  const questionNumbers = new Set<number>()

  for (const item of items) {
    if (!Number.isInteger(item.section_order_no) || item.section_order_no < 1) {
      throw new Error("The complete results response contains an invalid question number.")
    }
    if (questionNumbers.has(item.section_order_no)) {
      throw new Error("The complete results response contains duplicate question numbers.")
    }
    questionNumbers.add(item.section_order_no)
  }

  if (items.length !== firstPage.total_in_section) {
    throw new Error("The complete results response is incomplete. Please retry.")
  }

  for (let questionNumber = 1; questionNumber <= firstPage.total_in_section; questionNumber += 1) {
    if (!questionNumbers.has(questionNumber)) {
      throw new Error("The complete results response is incomplete. Please retry.")
    }
  }

  return {
    practice_session_id: firstPage.practice_session_id,
    section: firstPage.section,
    total_in_section: firstPage.total_in_section,
    items,
  }
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
