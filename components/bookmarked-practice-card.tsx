"use client"

import { BookmarkCheck, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { generatePractice, matchEntitlementErrorByExactMessage } from "@/lib/api"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"

interface BookmarkedPracticeCardProps {
  subjectId: number
  examTypeId: number
  savedQuestionCount: number
}

export function BookmarkedPracticeCard({
  subjectId,
  examTypeId,
  savedQuestionCount,
}: BookmarkedPracticeCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/subjects/${subjectId}`)}`)
      return
    }

    setIsStarting(true)
    setError(null)
    try {
      const response = await generatePractice({
        exam_type_id: examTypeId,
        subject_id: subjectId,
        mode: "MCQ",
        selection: { type: "BOOKMARKED" },
      })
      router.push(`/practice/${response.practice_session_id}`)
    } catch (startError) {
      const entitlement = matchEntitlementErrorByExactMessage(startError)
      setError(
        entitlement
          ? entitlement.message
          : startError instanceof ApiClientError && startError.code === "NO_SAVED_QUESTIONS"
            ? "There are no saved questions for this subject right now."
            : formatApiError(startError)
      )
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/[0.035] p-5 shadow-sm sm:p-6" aria-labelledby="bookmarked-questions-heading">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookmarkCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Saved for revision</p>
            <h2 id="bookmarked-questions-heading" className="mt-1 text-lg font-bold text-foreground">Bookmarked questions</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Practice your saved questions and active mistakes for this subject. Up to 25 questions are included.
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{savedQuestionCount} saved {savedQuestionCount === 1 ? "question" : "questions"}</p>
          </div>
        </div>
        <Button type="button" className="min-h-11 shrink-0 gap-2" onClick={() => void handleStart()} disabled={isStarting}>
          {isStarting ? "Starting..." : "Practice saved questions"}
          {!isStarting && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
    </section>
  )
}
