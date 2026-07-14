"use client"

import useSWR from "swr"
import {
  getPracticeSummary,
  getPracticeItems,
  getAnswers,
  getCompleteResults,
  getResults,
  type CompleteResultsResponse,
  type PracticeSummaryResponse,
  type PracticeItem,
  type GetAnswersResponse,
  type ResultsResponse,
  type Section,
} from "./index"

async function summaryFetcher([, id]: [string, number]): Promise<PracticeSummaryResponse> {
  return getPracticeSummary(id)
}

async function itemsFetcher([, id, section]: [string, number, Section]): Promise<PracticeItem[]> {
  return getPracticeItems(id, section)
}

async function answersFetcher([, id]: [string, number]): Promise<GetAnswersResponse> {
  return getAnswers(id)
}

async function resultsFetcher([, id, section, page, pageSize]: [string, number, Section, number, number]): Promise<ResultsResponse> {
  return getResults(id, section, page, pageSize)
}

async function completeResultsFetcher([, id, section]: [string, number, Section]): Promise<CompleteResultsResponse> {
  return getCompleteResults(id, section)
}

export function usePracticeSummary(practiceId: number | undefined, enabled: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<PracticeSummaryResponse>(
    practiceId && enabled ? ["practice-summary", practiceId] : null,
    summaryFetcher
  )
  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePracticeItems(practiceId: number | undefined, section: Section, enabled: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<PracticeItem[]>(
    practiceId && enabled ? ["practice-items", practiceId, section] : null,
    itemsFetcher
  )
  return {
    items: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePracticeAnswers(practiceId: number | undefined, enabled: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<GetAnswersResponse>(
    practiceId && enabled ? ["practice-answers", practiceId] : null,
    answersFetcher,
    {
      revalidateOnFocus: false,
    }
  )
  return {
    answers: data?.answers,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePracticeResults(
  practiceId: number | undefined,
  section: Section,
  page: number = 1,
  pageSize: number = 10,
  enabled: boolean = true
) {
  const { data, error, isLoading, mutate } = useSWR<ResultsResponse>(
    practiceId && enabled ? ["practice-results", practiceId, section, page, pageSize] : null,
    resultsFetcher
  )
  return {
    results: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCompletePracticeResults(
  practiceId: number | undefined,
  section: Section = "MCQ",
  enabled: boolean = true
) {
  const { data, error, isLoading, mutate } = useSWR<CompleteResultsResponse>(
    practiceId && enabled ? ["practice-results", practiceId, section, "complete"] : null,
    completeResultsFetcher,
    { revalidateOnFocus: false }
  )

  return {
    results: data,
    isLoading,
    isError: error,
    mutate,
  }
}
