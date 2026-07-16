"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Target,
  XCircle,
} from "@/components/icons"
import { QuestionReportDialog } from "@/components/question-report-dialog"
import { useSubjects } from "@/lib/api/hooks"
import { useCompletePracticeResults } from "@/lib/api/practice-hooks"
import { ApiClientError } from "@/lib/api/client"
import type { PracticeSummaryResponse, ResultItem } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface PracticeResultsContentProps {
  practiceId: number
  summary: PracticeSummaryResponse
}

export type ResultStatus = "correct" | "incorrect" | "unanswered"

export interface SessionResultSummary {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  unansweredCount: number
  needsReviewCount: number
  accuracyPercentage: number
}

function normalizeOptionLabel(value: string | null | undefined) {
  return typeof value === "string" ? value.trim().toUpperCase() : ""
}

function hasValidSelectedOption(item: ResultItem) {
  const selectedLabel = normalizeOptionLabel(item.user_answer?.selected_option_label)
  return Boolean(
    selectedLabel && item.mcq?.options.some((option) => normalizeOptionLabel(option.label) === selectedLabel)
  )
}

export function getResultStatus(item: ResultItem): ResultStatus {
  if (item.mcq?.is_correct === true) return "correct"
  if (!hasValidSelectedOption(item)) return "unanswered"
  return "incorrect"
}

export function calculateSessionResultSummary(items: ResultItem[]): SessionResultSummary {
  const counts = items.reduce(
    (result, item) => {
      result[getResultStatus(item)] += 1
      return result
    },
    { correct: 0, incorrect: 0, unanswered: 0 }
  )
  const totalQuestions = items.length
  const accuracyPercentage = totalQuestions === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((counts.correct / totalQuestions) * 100)))

  return {
    totalQuestions,
    correctCount: counts.correct,
    incorrectCount: counts.incorrect,
    unansweredCount: counts.unanswered,
    needsReviewCount: counts.incorrect + counts.unanswered,
    accuracyPercentage,
  }
}

export function getInitialQuestionIndex(items: ResultItem[]) {
  const firstNeedsReview = items.findIndex((item) => getResultStatus(item) !== "correct")
  return firstNeedsReview >= 0 ? firstNeedsReview : 0
}

export function getNextNeedsReviewIndex(items: ResultItem[], currentIndex: number) {
  if (!items.some((item) => getResultStatus(item) !== "correct")) return -1

  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (currentIndex + offset) % items.length
    if (getResultStatus(items[index]) !== "correct") return index
  }

  return -1
}

function statusCopy(status: ResultStatus) {
  if (status === "correct") return "Correct"
  if (status === "unanswered") return "Unanswered"
  return "Needs review"
}

function StatusIcon({ status, className }: { status: ResultStatus; className?: string }) {
  if (status === "correct") {
    return <CheckCircle2 className={cn("text-emerald-700", className)} aria-hidden="true" />
  }
  if (status === "unanswered") {
    return <span className={cn("inline-flex items-center justify-center rounded-full border-2 border-muted-foreground text-muted-foreground", className)} aria-hidden="true">−</span>
  }
  return <AlertCircle className={cn("text-amber-600", className)} aria-hidden="true" />
}

function NavigatorStatusIcon({ status, className }: { status: ResultStatus; className?: string }) {
  if (status === "correct") {
    return <CheckCircle2 className={cn("text-emerald-700", className)} aria-hidden="true" />
  }
  if (status === "unanswered") {
    return <span className={cn("inline-flex items-center justify-center rounded-full border-2 border-muted-foreground text-muted-foreground", className)} aria-hidden="true">âˆ’</span>
  }
  return <span className={cn("rounded-full bg-amber-500", className)} aria-hidden="true" />
}

export function PracticeResultsContent({ practiceId, summary }: PracticeResultsContentProps) {
  const router = useRouter()
  const { results, isLoading, isError, mutate } = useCompletePracticeResults(practiceId, "MCQ", true)
  const { subjects } = useSubjects("SSC", Boolean(results?.items.length))
  const subjectName = subjects?.find((subject) => subject.id === summary.subject_id)?.name

  useEffect(() => {
    if (isError instanceof ApiClientError && isError.status === 401) {
      router.push(`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`)
    }
  }, [isError, practiceId, router])

  if (isLoading) return <ResultsLoadingState />

  if (isError) {
    return <ResultsErrorState error={isError} practiceId={practiceId} onRetry={() => void mutate()} />
  }

  if (!results) {
    return <ResultsErrorState practiceId={practiceId} onRetry={() => void mutate()} />
  }

  if (results.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
        <Link href="/subjects" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to subjects
        </Link>
        <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center shadow-sm" role="status">
          <h1 className="text-2xl font-bold text-foreground">No MCQ results available</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            This submitted practice session does not contain any MCQ questions to review.
          </p>
          <Button asChild className="mt-6">
            <Link href="/subjects">Choose another subject</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ResultsWorkspace
      key={`${practiceId}-${results.total_in_section}`}
      items={results.items}
      subjectName={subjectName}
    />
  )
}

function ResultsLoadingState() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10" role="status" aria-label="Loading complete practice results" aria-live="polite">
      <span className="sr-only">Loading all questions and calculating your complete results.</span>
      <Skeleton className="mb-5 h-11 w-40" />
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_32rem]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-11 w-full max-w-lg" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <Skeleton className="h-[32rem] w-full" />
        <Skeleton className="h-[32rem] w-full" />
      </div>
    </div>
  )
}

function ResultsErrorState({
  error,
  practiceId,
  onRetry,
}: {
  error?: unknown
  practiceId: number
  onRetry: () => void
}) {
  const status = error instanceof ApiClientError ? error.status : undefined
  const content = status === 401
    ? {
        title: "Please sign in again",
        body: "Your session has expired. Sign in to return to these practice results.",
      }
    : status === 403
      ? {
          title: "These results are not available to this account",
          body: "This practice session belongs to another account, so its answers cannot be shown here.",
        }
      : status === 404
        ? {
            title: "Practice session not found",
            body: "This practice session may have expired or no longer exists.",
          }
        : status === 409
          ? {
              title: "Practice is not submitted yet",
              body: "Submit the practice session before opening its answer review.",
            }
          : {
              title: "Unable to load complete results",
              body: "We could not load every question, so no partial score or answer navigator is being shown.",
            }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center shadow-sm" role="alert">
        <AlertCircle className="mx-auto size-10 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{content.body}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {status === 401 ? (
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`}>Go to login</Link>
            </Button>
          ) : (
            <Button type="button" onClick={onRetry}>Retry</Button>
          )}
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/subjects">Back to subjects</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ResultsWorkspace({ items, subjectName }: { items: ResultItem[]; subjectName?: string }) {
  const summary = useMemo(() => calculateSessionResultSummary(items), [items])
  const initialIndex = getInitialQuestionIndex(items)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [reviewedNeedsReview, setReviewedNeedsReview] = useState<Set<number>>(() => {
    const initialItem = items[initialIndex]
    return initialItem && getResultStatus(initialItem) !== "correct"
      ? new Set([initialItem.practice_item_id])
      : new Set()
  })
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const currentItem = items[currentIndex]

  const moveToQuestion = (nextIndex: number, moveFocus = true) => {
    const nextItem = items[nextIndex]
    if (!nextItem) return
    setCurrentIndex(nextIndex)
    if (getResultStatus(nextItem) !== "correct") {
      setReviewedNeedsReview((current) => {
        if (current.has(nextItem.practice_item_id)) return current
        return new Set(current).add(nextItem.practice_item_id)
      })
    }
    if (moveFocus) {
      window.requestAnimationFrame(() => questionHeadingRef.current?.focus())
    }
  }

  const nextNeedsReviewIndex = getNextNeedsReviewIndex(items, currentIndex)
  const heading = subjectName ? `${subjectName} practice complete` : "Practice complete"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <Link href="/subjects" className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to subjects
      </Link>

      <div className="mb-6 grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_32rem]">
        <header>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Results</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{heading}</h1>
          <p className="mt-2 text-base text-muted-foreground">Review your answers one question at a time.</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{summary.totalQuestions} MCQs</p>
        </header>
        <SessionSummaryCards summary={summary} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <QuestionNavigator
          items={items}
          currentIndex={currentIndex}
          reviewedCount={reviewedNeedsReview.size}
          needsReviewCount={summary.needsReviewCount}
          nextNeedsReviewIndex={nextNeedsReviewIndex}
          onSelect={(index) => moveToQuestion(index, false)}
          onReviewNext={() => nextNeedsReviewIndex >= 0 && moveToQuestion(nextNeedsReviewIndex)}
        />
        <QuestionReviewPanel
          item={currentItem}
          currentIndex={currentIndex}
          totalQuestions={items.length}
          headingRef={questionHeadingRef}
          onPrevious={() => moveToQuestion(currentIndex - 1)}
          onNext={() => moveToQuestion(currentIndex + 1)}
        />
      </div>

      <aside className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="weak-areas-handoff-heading">
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="weak-areas-handoff-heading" className="font-semibold text-foreground">Ready for the next step?</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Review all the questions, then use Weak Areas to plan another session.</p>
          </div>
        </div>
        <Link href="/dashboard/weak-areas" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none">
          View weak areas
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  )
}

function SessionSummaryCards({ summary }: { summary: SessionResultSummary }) {
  return (
    <section className="grid grid-cols-1 gap-2 rounded-2xl border border-primary/15 bg-card p-2 shadow-sm sm:grid-cols-3" aria-label="Complete session summary">
      <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl border border-border/80 px-3 py-3 text-center sm:flex-col sm:gap-1">
        <CheckCircle2 className="size-7 text-emerald-700" aria-hidden="true" />
        <div>
          <p className="text-2xl font-bold text-foreground">{summary.correctCount}</p>
          <p className="text-xs font-medium text-emerald-700">Correct</p>
        </div>
      </div>
      <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl border border-border/80 px-3 py-3 text-center sm:flex-col sm:gap-1">
        <AlertCircle className="size-7 text-amber-600" aria-hidden="true" />
        <div>
          <p className="text-2xl font-bold text-foreground">{summary.needsReviewCount}</p>
          <p className="text-xs font-medium text-amber-700">Needs review</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{summary.incorrectCount} incorrect · {summary.unansweredCount} unanswered</p>
        </div>
      </div>
      <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl border border-border/80 px-3 py-3 text-center sm:flex-col sm:gap-1">
        <div
          className="flex size-12 items-center justify-center rounded-full p-1"
          style={{ background: `conic-gradient(var(--primary) ${summary.accuracyPercentage}%, var(--muted) 0)` }}
          role="progressbar"
          aria-label="Session accuracy"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.accuracyPercentage}
        >
          <span className="flex size-full items-center justify-center rounded-full bg-card text-sm font-bold text-foreground">{summary.accuracyPercentage}%</span>
        </div>
        <p className="text-xs font-medium text-primary">Accuracy</p>
      </div>
    </section>
  )
}

function QuestionNavigator({
  items,
  currentIndex,
  reviewedCount,
  needsReviewCount,
  nextNeedsReviewIndex,
  onSelect,
  onReviewNext,
}: {
  items: ResultItem[]
  currentIndex: number
  reviewedCount: number
  needsReviewCount: number
  nextNeedsReviewIndex: number
  onSelect: (index: number) => void
  onReviewNext: () => void
}) {
  const reviewedPercentage = needsReviewCount === 0
    ? 100
    : Math.min(100, Math.round((reviewedCount / needsReviewCount) * 100))

  return (
    <aside className="rounded-2xl border border-primary/15 bg-card p-5 shadow-sm" aria-labelledby="question-navigator-heading">
      <h2 id="question-navigator-heading" className="text-lg font-bold text-foreground">Questions</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose a question to review.</p>
      <nav className="mt-4 grid grid-cols-1 gap-2" aria-label="Result questions">
        {items.map((item, index) => {
          const status = getResultStatus(item)
          const selected = index === currentIndex
          return (
            <button
              key={item.practice_item_id}
              type="button"
              onClick={() => onSelect(index)}
              aria-current={selected ? "true" : undefined}
              aria-label={`Question ${item.section_order_no}, ${statusCopy(status).toLowerCase()}${selected ? ", selected" : ""}`}
              className={cn(
                "flex min-h-11 w-full items-center justify-between rounded-lg border bg-background px-4 text-base font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
              )}
            >
              <span>{item.section_order_no}</span>
              <NavigatorStatusIcon status={status} className={status === "incorrect" ? "size-2.5 shrink-0" : "size-5 shrink-0"} />
            </button>
          )
        })}
      </nav>

      <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground" aria-label="Question status legend">
        {(["correct", "incorrect", "unanswered"] as const).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <NavigatorStatusIcon status={status} className={status === "incorrect" ? "size-2.5 shrink-0" : "size-4 shrink-0"} />
            <span>{statusCopy(status)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">Reviewed {reviewedCount} of {needsReviewCount}</p>
        {needsReviewCount > 0 && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Needs-review questions opened" aria-valuemin={0} aria-valuemax={needsReviewCount} aria-valuenow={reviewedCount}>
            <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${reviewedPercentage}%` }} />
          </div>
        )}
      </div>

      <Button type="button" variant="outline" className="mt-5 min-h-11 w-full bg-transparent" onClick={onReviewNext} disabled={nextNeedsReviewIndex < 0}>
        {nextNeedsReviewIndex < 0 ? "No mistakes to review" : "Review next mistake"}
      </Button>
    </aside>
  )
}

function QuestionReviewPanel({
  item,
  currentIndex,
  totalQuestions,
  headingRef,
  onPrevious,
  onNext,
}: {
  item: ResultItem
  currentIndex: number
  totalQuestions: number
  headingRef: React.RefObject<HTMLHeadingElement | null>
  onPrevious: () => void
  onNext: () => void
}) {
  const status = getResultStatus(item)
  const selectedLabel = normalizeOptionLabel(item.user_answer?.selected_option_label)
  const correctLabel = normalizeOptionLabel(item.mcq?.correct_option_label)
  const options = item.mcq?.options ?? []
  const uniqueLabels = new Set(options.map((option) => normalizeOptionLabel(option.label)).filter(Boolean))
  const optionsAvailable = options.length >= 2 && uniqueLabels.size === options.length && Boolean(correctLabel) && uniqueLabels.has(correctLabel)
  const questionText = typeof item.question?.stem_text === "string" && item.question.stem_text.trim()
    ? item.question.stem_text
    : "This question text is unavailable."
  const explanation = typeof item.question?.explanation === "string" && item.question.explanation.trim()
    ? item.question.explanation
    : "No explanation is available for this question yet."

  return (
    <article className="min-w-0 rounded-2xl border border-primary/15 bg-card p-4 shadow-sm sm:p-6" aria-labelledby="current-question-heading">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="current-question-heading" ref={headingRef} tabIndex={-1} className="rounded-sm text-base font-semibold text-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            Question {item.section_order_no} of {totalQuestions}
          </h2>
          <span className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium",
            status === "correct" ? "text-emerald-700" : status === "incorrect" ? "text-amber-700" : "text-muted-foreground"
          )}>
            <StatusIcon status={status} className="size-5" />
            {statusCopy(status)}
          </span>
        </div>
        <QuestionReportDialog questionId={item.question?.id} />
      </div>

      <p className="mt-6 text-lg font-semibold leading-7 text-foreground sm:text-xl sm:leading-8">{questionText}</p>

      {status === "unanswered" && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
          <AlertCircle className="size-4 text-muted-foreground" aria-hidden="true" />
          No answer submitted
        </p>
      )}

      {optionsAvailable ? (
        <div className="mt-4 space-y-2" aria-label="Answer comparison">
          {options.map((option) => {
            const optionLabel = normalizeOptionLabel(option.label)
            const isSelected = optionLabel === selectedLabel
            const isCorrect = optionLabel === correctLabel
            return (
              <div
                key={option.label}
                className={cn(
                  "flex min-h-12 min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5",
                  isCorrect && "border-success/70 bg-success/[0.06]",
                  isSelected && !isCorrect && "border-destructive/60 bg-destructive/[0.045]",
                  !isCorrect && !(isSelected && !isCorrect) && "border-border bg-background"
                )}
              >
                <span className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  isCorrect ? "border-success bg-success text-white" : isSelected ? "border-destructive text-destructive" : "border-border text-foreground"
                )}>{option.label}</span>
                <span className="min-w-0 flex-1 break-words text-sm text-foreground">{option.option_text}</span>
                {(isCorrect || isSelected) && (
                  <span className={cn(
                    "flex shrink-0 items-center gap-1 text-right text-xs font-medium",
                    isCorrect ? "text-emerald-700" : "text-destructive"
                  )}>
                    {isCorrect ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <XCircle className="size-4" aria-hidden="true" />}
                    <span className="hidden sm:inline">
                      {isCorrect && isSelected ? "Your answer · Correct answer" : isCorrect ? "Correct answer" : "Your answer"}
                    </span>
                    <span className="sr-only sm:hidden">
                      {isCorrect && isSelected ? "Your answer. Correct answer." : isCorrect ? "Correct answer." : "Your answer."}
                    </span>
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-muted/35 p-4" role="status">
          <h3 className="font-semibold text-foreground">Answer options unavailable</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">The choices for this question are missing or incomplete. You can report the question or continue reviewing the other results.</p>
        </div>
      )}

      <section className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.035] p-4" aria-labelledby={`explanation-heading-${item.practice_item_id}`}>
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-card text-primary">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 id={`explanation-heading-${item.practice_item_id}`} className="font-semibold text-foreground">Explanation</h3>
            <p className="mt-1 text-sm italic leading-6 text-muted-foreground">{explanation}</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid items-center gap-3 border-t border-border pt-5 sm:grid-cols-[1fr_auto_1fr]">
        <Button type="button" variant="outline" className="min-h-11 justify-center gap-2 bg-transparent sm:justify-self-start" onClick={onPrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous question
        </Button>
        <span className="text-center text-sm text-muted-foreground">{currentIndex + 1} of {totalQuestions}</span>
        <Button type="button" className="min-h-11 justify-center gap-2 sm:justify-self-end" onClick={onNext} disabled={currentIndex === totalQuestions - 1}>
          Next question
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}
