/**
 * Backend API Types
 * Matches the backend contract in docs/BACKEND_INTEGRATION_BRIEF.md
 */

// ============================================
// ERROR FORMAT
// ============================================

export interface ApiError {
  code?: string
  message: string
}

// ============================================
// AUTH TYPES
// ============================================

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  school: string
  city: string
  studentClass: number
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    full_name: string
    role: string
    plan_tier: string
    school: string
    city: string
    student_class: number
    created_at: string
    updated_at: string
  }
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

// ============================================
// EXAM TYPES
// ============================================

export interface ExamType {
  id: number
  code: string
  name: string
}

// ============================================
// SUBJECT TYPES
// ============================================

export interface Subject {
  id: number
  name: string
  exam_type_id?: number
  exam_type_code?: string
  exam_type_name?: string
}

export interface Chapter {
  id: number
  chapter_name: string
}

// ============================================
// PRACTICE SESSION TYPES
// ============================================

export type PracticeMode = "MCQ" | "CQ" | "MIXED"
export type SelectionType = "CHAPTERS"
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED"
export type Section = "MCQ" | "CQ"
export type AnswerType = "MCQ" | "CQ"
export type Language = "bn" | "en"

export interface PracticeGenerateRequest {
  exam_type_id: number
  subject_id: number
  selection: {
    type: SelectionType
    chapter_ids: number[]
  }
  mode: PracticeMode
  mcq_count: number
  cq_count: number
  language: Language
}

export interface PracticeGenerateResponse {
  practice_session_id: number
  mcq_total: number
  cq_total: number
}

export interface PracticeSummaryResponse {
  practice_session_id: number
  exam_type_id: number
  subject_id: number
  mode: PracticeMode
  attempt_status: AttemptStatus
  mcq_total?: number
  cq_total?: number
}

export interface PracticeItem {
  section_order_no: number
  order_no: number
  practice_item_id: number
  question_id: number
}

export interface PracticeItemsResponse extends Array<PracticeItem> {}

// ============================================
// ANSWER TYPES
// ============================================

export interface McqAnswer {
  practice_item_id: number
  answer_type: "MCQ"
  selected_option_label: string
}

export interface CqAnswer {
  practice_item_id: number
  answer_type: "CQ"
  cq_text: string
}

export type AnswerPayload = McqAnswer | CqAnswer

export interface SaveAnswersRequest {
  answers: AnswerPayload[]
}

export interface SaveAnswersResponse {
  saved: boolean
}

export interface StoredAnswer {
  practice_item_id: number
  answer_type: AnswerType
  selected_option_label: string | null
  cq_text: string | null
  updated_at: string
}

export interface GetAnswersResponse {
  answers: StoredAnswer[]
}

// ============================================
// SUBMIT TYPES
// ============================================

export interface SubmitResponse {
  practice_session_id: number
  mcq_total: number
  mcq_correct: number
  mcq_score: number
}

// ============================================
// RESULTS TYPES
// ============================================

export interface McqOption {
  label: string
  option_text: string
}

export interface QuestionPart {
  label: string
  order_no?: number
  prompt_text?: string
  marks: number
  sample_answer?: string
  explanation?: string
  reference_text?: string
}

export interface QuestionDetailBase {
  id: number
  question_type: "MCQ" | "CREATIVE" | "SHORT"
  stem_text: string
  explanation?: string
  language: Language
  media?: unknown[]
}

export interface McqQuestionDetail extends QuestionDetailBase {
  question_type: "MCQ"
  options: McqOption[]
}

export interface CqQuestionDetail extends QuestionDetailBase {
  question_type: "CREATIVE" | "SHORT"
  parts?: QuestionPart[]
}

export type QuestionDetail = McqQuestionDetail | CqQuestionDetail

export interface QuestionData {
  id: number
  question_type: "MCQ" | "CQ"
  stem_text: string
  explanation: string
  difficulty: number
  source: string
  language: Language
}

export interface McqResultData {
  correct_option_label: string
  is_correct: boolean
  options: McqOption[]
}

export interface UserAnswerData {
  selected_option_label?: string
  cq_text?: string
}

export interface ResultItem {
  section_order_no: number
  order_no: number
  practice_item_id: number
  question: QuestionData
  user_answer: UserAnswerData
  mcq?: McqResultData
  media: unknown[]
}

export interface ResultsResponse {
  practice_session_id: number
  section: Section
  page: number
  page_size: number
  total_in_section: number
  items: ResultItem[]
}

export interface ResultsJumpResponse {
  item: ResultItem
}
