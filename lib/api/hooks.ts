"use client"

import useSWR from "swr"
import {
  getExamTypes,
  getSubjects,
  getSubjectChapters,
  type ExamType,
  type Subject,
  type Chapter,
} from "./index"

// Custom fetchers that wrap our API functions
async function examTypesFetcher(): Promise<ExamType[]> {
  return getExamTypes()
}

async function subjectsFetcher([, examTypeId]: [string, number]): Promise<Subject[]> {
  return getSubjects(examTypeId)
}

async function chaptersFetcher([, subjectId]: [string, number]): Promise<Chapter[]> {
  return getSubjectChapters(subjectId)
}

// SWR hooks
export function useExamTypes() {
  const { data, error, isLoading, mutate } = useSWR<ExamType[]>(
    "exam-types",
    examTypesFetcher
  )
  return {
    examTypes: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useSubjects(examTypeId: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Subject[]>(
    examTypeId ? ["subjects", examTypeId] : null,
    subjectsFetcher
  )
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
    chaptersFetcher
  )
  return {
    chapters: data,
    isLoading,
    isError: error,
    mutate,
  }
}
