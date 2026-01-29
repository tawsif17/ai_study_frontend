"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ArrowLeft } from "@/components/icons"
import { usePracticeResults } from "@/lib/api/practice-hooks"
import type { PracticeSummaryResponse, Section, ResultItem } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface PracticeResultsContentProps {
  practiceId: number
  summary: PracticeSummaryResponse
}

export function PracticeResultsContent({ practiceId, summary }: PracticeResultsContentProps) {
  const [currentSection, setCurrentSection] = useState<Section>(summary.mode === "CQ" ? "CQ" : "MCQ")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { results, isLoading } = usePracticeResults(practiceId, currentSection, currentPage, pageSize, true)

  // Calculate stats from results
  const totalInSection = results?.total_in_section || 0
  const totalPages = Math.ceil(totalInSection / pageSize)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subjects
        </Link>

        <Card className="border-border bg-card shadow-md overflow-hidden">
          <CardContent className="p-0">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 text-center border-b border-border">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground mb-1">Practice Complete!</h1>
              <p className="text-muted-foreground">Review your answers below</p>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="flex items-center justify-center gap-4 text-sm">
                <Badge variant="secondary">{summary.mode} Practice</Badge>
                <span className="text-muted-foreground">
                  Session #{summary.practice_session_id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - only show if mode is mixed or has both sections */}
      {summary.mode !== "CQ" && summary.mode !== "MCQ" && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={currentSection === "MCQ" ? "default" : "outline"}
            onClick={() => { setCurrentSection("MCQ"); setCurrentPage(1) }}
            className={currentSection !== "MCQ" ? "bg-transparent" : ""}
          >
            MCQ Results
          </Button>
          <Button
            variant={currentSection === "CQ" ? "default" : "outline"}
            onClick={() => { setCurrentSection("CQ"); setCurrentPage(1) }}
            className={currentSection !== "CQ" ? "bg-transparent" : ""}
          >
            CQ Results
          </Button>
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : results && results.items.length > 0 ? (
        <div className="space-y-4">
          {results.items.map((item) => (
            <ResultItemCard key={item.practice_item_id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for this section.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-2 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Back to practice */}
      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/subjects">Start New Practice</Link>
        </Button>
      </div>
    </div>
  )
}

function ResultItemCard({ item }: { item: ResultItem }) {
  const isMcq = item.question.question_type === "MCQ"
  const isCorrect = item.mcq?.is_correct

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-semibold">
              Q{item.section_order_no}
            </Badge>
            <Badge variant="outline">{item.question.question_type}</Badge>
            {item.question.source && (
              <Badge variant="outline" className="text-muted-foreground">
                {item.question.source}
              </Badge>
            )}
          </div>
          {isMcq && (
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              isCorrect ? "text-success" : "text-destructive"
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Incorrect
                </>
              )}
            </div>
          )}
        </div>

        {/* Question stem */}
        <p className="text-card-foreground mb-4 leading-relaxed">
          {item.question.stem_text}
        </p>

        {/* MCQ Options */}
        {isMcq && item.mcq && (
          <div className="space-y-2 mb-4">
            {item.mcq.options.map((option) => {
              const isUserAnswer = item.user_answer?.selected_option_label === option.label
              const isCorrectOption = item.mcq?.correct_option_label === option.label

              return (
                <div
                  key={option.label}
                  className={cn(
                    "p-3 rounded-lg border-2 flex items-center gap-3",
                    isCorrectOption && "border-success bg-success/10",
                    isUserAnswer && !isCorrectOption && "border-destructive bg-destructive/10",
                    !isUserAnswer && !isCorrectOption && "border-border bg-background opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0",
                      isCorrectOption && "bg-success text-white",
                      isUserAnswer && !isCorrectOption && "bg-destructive text-white",
                      !isUserAnswer && !isCorrectOption && "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="text-sm">{option.option_text}</span>
                  {isCorrectOption && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-success shrink-0" />
                  )}
                  {isUserAnswer && !isCorrectOption && (
                    <XCircle className="ml-auto h-4 w-4 text-destructive shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CQ User Answer */}
        {!isMcq && item.user_answer?.cq_text && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Answer:</h4>
            <p className="text-sm text-card-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
              {item.user_answer.cq_text}
            </p>
          </div>
        )}

        {/* Explanation */}
        {item.question.explanation && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-primary mb-2">Explanation:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
