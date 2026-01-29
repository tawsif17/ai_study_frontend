"use client"

import useSWR from "swr"
import {
  getPracticeSummary,
  getPracticeItems,
  getAnswers,
  getResults,
  type PracticeSummaryResponse,
  type PracticeItem,
  type GetAnswersResponse,
  type ResultsResponse,
  type Section,
} from "./index"

async function summaryFetcher([, id]: [string, number]): Promise<PracticeSummaryResponse> {
  return getPracticeSummary(id)
}

async function itemsFetcher([, id, section]: [string, number, Section | undefined]): Promise<PracticeItem[]> {
  return getPracticeItems(id, section)
}

async function answersFetcher([, id]: [string, number]): Promise<GetAnswersResponse> {
  return getAnswers(id)
}

async function resultsFetcher([, id, section, page, pageSize]: [string, number, Section, number, number]): Promise<ResultsResponse> {
  return getResults(id, section, page, pageSize)
}

export function usePracticeSummary(practiceId: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR<PracticeSummaryResponse>(
    practiceId ? ["practice-summary", practiceId] : null,
    summaryFetcher
  )
  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePracticeItems(practiceId: number | undefined, section?: Section) {
  const { data, error, isLoading, mutate } = useSWR<PracticeItem[]>(
    practiceId ? ["practice-items", practiceId, section] : null,
    itemsFetcher
  )
  return {
    items: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePracticeAnswers(practiceId: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR<GetAnswersResponse>(
    practiceId ? ["practice-answers", practiceId] : null,
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
