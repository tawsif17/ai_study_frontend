"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowRight, Clock } from "@/components/icons"
import {
  generatePractice,
  matchEntitlementErrorByExactMessage,
  type Language,
  type PracticeMode,
} from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"

type IconComponent = React.ComponentType<{ className?: string }>

interface PracticeConfigCardProps {
  mode: PracticeMode
  subjectId: number
  examTypeId: number
  chapterIds: number[]
  icon: IconComponent
  title: string
  subtitle: string
  tag: string
  iconBgClass?: string
  iconTextClass?: string
  disabled?: boolean
  availability?: "available" | "coming-soon"
}

const mcqCountOptions = [
  { value: "10", label: "10 questions" },
  { value: "20", label: "20 questions" },
  { value: "25", label: "25 questions" },
]

const ACTIVE_LANGUAGE: Language = "en"

export function PracticeConfigCard({
  mode,
  subjectId,
  examTypeId,
  chapterIds,
  icon: Icon,
  title,
  subtitle,
  tag,
  iconBgClass = "bg-primary/10",
  iconTextClass = "text-primary",
  disabled = false,
  availability = "available",
}: PracticeConfigCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [count, setCount] = useState("10")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controlIdPrefix = `practice-${subjectId}-${mode.toLowerCase()}`
  const isComingSoon = availability === "coming-soon"
  const comingSoonFeature =
    mode === "MIXED" ? "Combined MCQ + CQ sessions" : mode === "CQ" ? "Creative Question practice" : "Additional practice options"

  const handleStartPractice = async () => {
    if (isComingSoon) {
      return
    }

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (chapterIds.length === 0) {
      setError("Please select at least one chapter")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await generatePractice({
        exam_type_id: examTypeId,
        subject_id: subjectId,
        selection: {
          type: "CHAPTERS",
          chapter_ids: chapterIds,
        },
        mode,
        mcq_count: Number.parseInt(count, 10),
        cq_count: 0,
        language: ACTIVE_LANGUAGE,
      })

      const query = response.warning?.message
        ? `?warning=${encodeURIComponent(response.warning.message)}`
        : ""

      router.push(`/practice/${response.practice_session_id}${query}`)
    } catch (err) {
      const entitlement = matchEntitlementErrorByExactMessage(err)
      setError(entitlement ? entitlement.message : formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const isStartDisabled = disabled || isLoading

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg sm:p-6">
      <span className="absolute -top-2.5 left-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
        {tag}
      </span>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ${isComingSoon ? "opacity-70" : ""}`}>
          <Icon className={`h-6 w-6 ${iconTextClass}`} />
        </div>
        {isComingSoon && (
          <span className="inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium leading-none text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            Upcoming
          </span>
        )}
      </div>

      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 min-h-10 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

      <div className="mb-5 flex-1 space-y-4 border-t border-border pt-4">
        {isComingSoon ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
            <div className="text-xs font-medium text-muted-foreground">Preview</div>
            <div className="mt-2 text-sm font-medium text-foreground">{comingSoonFeature}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This mode is being prepared and is not available to start yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label id={`${controlIdPrefix}-count-label`} className="text-xs font-medium text-muted-foreground">
              Number of questions
            </Label>
            <Select value={count} onValueChange={setCount} disabled={isLoading}>
              <SelectTrigger className="h-9 w-full text-sm" aria-labelledby={`${controlIdPrefix}-count-label`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mcqCountOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Language</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex min-h-10 items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground">
              <span>English</span>
              <span className="text-xs text-primary">Active</span>
            </div>
            <div
              className="flex min-h-10 min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
              aria-disabled="true"
            >
              <span className="min-w-0 truncate">Bangla</span>
              <span className="shrink-0 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mb-3 text-center text-xs text-destructive" role="alert">{error}</p>}

      <p className="mb-3 text-center text-xs text-muted-foreground">
        {isComingSoon
          ? "This option will be added in a future release."
          : "You can pause anytime. Your progress is saved automatically."}
      </p>

      <Button
        onClick={handleStartPractice}
        className="w-full gap-2 group-hover:bg-primary/90"
        disabled={isComingSoon || isStartDisabled}
        aria-disabled={isComingSoon || isStartDisabled}
      >
        {isComingSoon ? "Coming Soon" : isLoading ? "Starting..." : "Start Practice"}
        {!isLoading && !isComingSoon && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </Button>

      {disabled && !isComingSoon && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">Select chapters above to start practicing.</p>
      )}
    </div>
  )
}
