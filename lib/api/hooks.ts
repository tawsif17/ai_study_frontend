"use client"

import useSWR from "swr"
import {
  getExamTypes,
  getQuestions,
  getSubjectChapters,
  getSubjects,
  type Chapter,
  type ExamType,
  type QuestionListItem,
  type QuestionsListRequest,
  type Subject,
} from "./index"

async function examTypesFetcher(): Promise<ExamType[]> {
  return getExamTypes()
}

async function subjectsFetcher([, examType]: [string, string | undefined]): Promise<Subject[]> {
  return getSubjects(examType)
}

async function chaptersFetcher([, subjectId]: [string, number]): Promise<Chapter[]> {
  return getSubjectChapters(subjectId)
}

async function questionsFetcher([, query]: [string, QuestionsListRequest]): Promise<QuestionListItem[]> {
  const response = await getQuestions(query)
  return response.questions
}

export function useExamTypes() {
  const { data, error, isLoading, mutate } = useSWR<ExamType[]>("exam-types", examTypesFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 5 * 60 * 1000,
  })

  return {
    examTypes: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useSubjects(examType?: string, enabled: boolean = true) {
  const key = enabled ? ["subjects", examType] : null
  const { data, error, isLoading, mutate } = useSWR<Subject[]>(key, subjectsFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 5 * 60 * 1000,
  })

  return {
    subjects: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useChapters(subjectId: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Chapter[]>(
    subjectId ? ["chapters", subjectId] : null,
    chaptersFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  )
  return {
    chapters: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useQuestions(query: QuestionsListRequest | null, enabled: boolean = true) {
  const key = enabled && query ? (["questions", query] as const) : null
  const { data, error, isLoading, mutate } = useSWR<QuestionListItem[]>(key, questionsFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 30 * 1000,
  })

  return {
    questions: data,
    isLoading,
    isError: error,
    mutate,
  }
}
