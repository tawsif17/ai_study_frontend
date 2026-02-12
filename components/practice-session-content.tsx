"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, CheckCircle } from "@/components/icons"
import useSWR, { useSWRConfig } from "swr"
import { usePracticeItems, usePracticeAnswers } from "@/lib/api/practice-hooks"
import { saveAnswers, submitPractice, getQuestionById } from "@/lib/api"
import type { PracticeSummaryResponse, AnswerPayload, QuestionDetail } from "@/lib/api/types"
import { formatApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"

interface PracticeSessionContentProps {
  practiceId: number
  summary: PracticeSummaryResponse
}

export function PracticeSessionContent({ practiceId, summary }: PracticeSessionContentProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const hasMcq = (summary.mcq_total ?? 0) > 0
  const hasCq = (summary.cq_total ?? 0) > 0
  const [currentSection, setCurrentSection] = useState<"MCQ" | "CQ">(
    summary.mode === "CQ" ? "CQ" : hasMcq ? "MCQ" : "CQ"
  )
  const { items, isLoading: itemsLoading } = usePracticeItems(practiceId, currentSection)
  const { answers: savedAnswers, mutate: mutateAnswers } = usePracticeAnswers(practiceId)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [localAnswers, setLocalAnswers] = useState<Map<number, string>>(new Map()) // practice_item_id -> answer
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!items || items.length === 0) return
    setCurrentIndex((idx) => Math.min(idx, items.length - 1))
  }, [items?.length])

  useEffect(() => {
    setCurrentIndex(0)
  }, [currentSection])

  // Initialize local answers from server
  useEffect(() => {
    if (savedAnswers) {
      const answerMap = new Map<number, string>()
      for (const ans of savedAnswers) {
        if (ans.answer_type === "MCQ" && ans.selected_option_label) {
          answerMap.set(ans.practice_item_id, ans.selected_option_label)
        } else if (ans.answer_type === "CQ" && ans.cq_text) {
          answerMap.set(ans.practice_item_id, ans.cq_text)
        }
      }
      setLocalAnswers(answerMap)
    }
  }, [savedAnswers])

  const saveCurrentAnswer = useCallback(async (itemId: number, answer: string, type: "MCQ" | "CQ") => {
    setIsSaving(true)
    try {
      const payload: AnswerPayload = type === "MCQ"
        ? { practice_item_id: itemId, answer_type: "MCQ", selected_option_label: answer }
        : { practice_item_id: itemId, answer_type: "CQ", cq_text: answer }
      
      await saveAnswers(practiceId, { answers: [payload] })
      mutateAnswers()
    } catch (error) {
      console.error("Failed to save answer:", error)
    } finally {
      setIsSaving(false)
    }
  }, [practiceId, mutateAnswers])

  const handleAnswerSelect = useCallback((itemId: number, answer: string, type: "MCQ" | "CQ") => {
    setLocalAnswers((prev) => {
      const next = new Map(prev)
      next.set(itemId, answer)
      return next
    })
    // Save to server
    saveCurrentAnswer(itemId, answer, type)
  }, [saveCurrentAnswer])

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await submitPractice(practiceId)
      await mutate(["practice-summary", practiceId])
      router.refresh()
    } catch (error) {
      console.error("Failed to submit:", error)
      setSubmitError(formatApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentItem = items?.[currentIndex]
  const questionId = currentItem?.question_id

  const { data: question, isLoading: questionLoading } = useSWR<QuestionDetail>(
    questionId ? ["question-detail", questionId] : null,
    () => getQuestionById(questionId!)
  )

  if (itemsLoading || !items) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (items.length === 0 || !currentItem) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">No questions available</h1>
        <p className="text-muted-foreground">
          This practice session does not have any questions for the selected section.
        </p>
      </div>
    )
  }

  const totalItems = items.length
  const answeredCount = localAnswers.size
  const isLastItem = currentIndex === totalItems - 1
  const displayNumber = currentItem.section_order_no ?? currentIndex + 1

  return (
    <div className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-sm">
            {summary.mode} Practice
          </Badge>
          <span className="text-sm text-muted-foreground">
            {answeredCount} of {totalItems} answered
          </span>
        </div>
        {summary.mode === "MIXED" && (
          <div className="mb-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={currentSection === "MCQ" ? "default" : "outline"}
              onClick={() => setCurrentSection("MCQ")}
              disabled={!hasMcq || itemsLoading}
              className={currentSection !== "MCQ" ? "bg-transparent" : ""}
            >
              MCQ
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentSection === "CQ" ? "default" : "outline"}
              onClick={() => setCurrentSection("CQ")}
              disabled={!hasCq || itemsLoading}
              className={currentSection !== "CQ" ? "bg-transparent" : ""}
            >
              CQ
            </Button>
          </div>
        )}
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalItems) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-3xl">
          {/* Question Card */}
          <Card className="border-border bg-card shadow-md mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="font-semibold">
                  Q{displayNumber}
                </Badge>
                <Badge variant="outline">{currentSection}</Badge>
              </div>

              {questionLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : question ? (
                <>
                  <p className="text-muted-foreground mb-4">{question.stem_text || "Question text unavailable."}</p>
                  <p className="text-xs text-muted-foreground">
                    Question ID: {question.id ?? questionId ?? "N/A"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unable to load question details right now.
                </p>
              )}

              {/* Answer options for MCQ */}
              {currentSection === "MCQ" && (
                <div className="space-y-2 mt-6">
                  {(question?.question_type === "MCQ" ? question.options ?? [] : []).map((opt) => {
                    const isSelected = localAnswers.get(currentItem.practice_item_id) === opt.label
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleAnswerSelect(currentItem.practice_item_id, opt.label, "MCQ")}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                          "hover:border-primary/50 hover:bg-primary/5",
                          isSelected && "border-primary bg-primary/10",
                          !isSelected && "border-border bg-background"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                              isSelected && "bg-primary text-primary-foreground",
                              !isSelected && "bg-muted text-muted-foreground"
                            )}
                          >
                            {opt.label}
                          </span>
                          <span className="text-card-foreground">{opt.option_text}</span>
                        </div>
                      </button>
                    )
                  })}
                  {question && question.question_type === "MCQ" && question.options.length === 0 && (
                    <p className="text-sm text-muted-foreground">No options available for this question.</p>
                  )}
                </div>
              )}

              {/* Text area for CQ */}
              {currentSection === "CQ" && (
                <div className="mt-6">
                  <textarea
                    className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-background text-foreground resize-y"
                    placeholder="Write your answer here..."
                    value={localAnswers.get(currentItem.practice_item_id) || ""}
                    onChange={(e) => handleAnswerSelect(currentItem.practice_item_id, e.target.value, "CQ")}
                  />
                  {question && question.question_type !== "MCQ" && question.parts && question.parts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {question.parts
                        .slice()
                        .sort((a, b) => (a.order_no ?? 0) - (b.order_no ?? 0))
                        .map((part) => (
                        <div key={part.label} className="rounded-lg border border-border bg-muted/40 p-3">
                          <div className="text-sm font-medium text-foreground">
                            Part {part.label} ({Number.isFinite(part.marks) ? part.marks : 0} marks)
                          </div>
                          {part.prompt_text && (
                            <p className="text-sm text-card-foreground mt-2">{part.prompt_text}</p>
                          )}
                          {!part.prompt_text && part.reference_text && (
                            <p className="text-xs text-muted-foreground mt-1">{part.reference_text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          {submitError && (
            <p className="text-xs text-destructive text-center mb-3">{submitError}</p>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastItem ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(totalItems - 1, i + 1))}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Question counter (mobile) */}
          <div className="mt-4 text-center text-sm text-muted-foreground lg:hidden">
            Question {currentIndex + 1} of {totalItems}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24 bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {items.map((item, idx) => {
                const isAnswered = localAnswers.has(item.practice_item_id)
                const isCurrent = idx === currentIndex
                return (
                  <button
                    key={item.practice_item_id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-9 h-9 rounded-full text-sm font-medium transition-all duration-200",
                      isCurrent && "ring-2 ring-primary ring-offset-2",
                      isAnswered && "bg-primary text-primary-foreground",
                      !isAnswered && "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.section_order_no ?? idx + 1}
                  </button>
                )
              })}
            </div>
            
            {isSaving && (
              <p className="text-xs text-muted-foreground mt-4 text-center">Saving...</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
