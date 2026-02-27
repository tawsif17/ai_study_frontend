"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "@/components/icons"
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
}

const mcqCountOptions = [
  { value: "10", label: "10 questions" },
  { value: "20", label: "20 questions" },
  { value: "25", label: "25 questions" },
]

const cqCountOptions = [
  { value: "2", label: "2 questions" },
  { value: "3", label: "3 questions" },
  { value: "5", label: "5 questions" },
]

const languageOptions = [
  { value: "bn", label: "Bangla" },
  { value: "en", label: "English" },
]

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
}: PracticeConfigCardProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [count, setCount] = useState(mode === "MCQ" ? "10" : "2")
  const [mixedMcqCount, setMixedMcqCount] = useState("10")
  const [mixedCqCount, setMixedCqCount] = useState("2")
  const [language, setLanguage] = useState<Language>("bn")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeCta, setShowUpgradeCta] = useState(false)
  const requiresProForMode = user?.plan_tier === "free" && (mode === "CQ" || mode === "MIXED")

  const handleStartPractice = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (requiresProForMode) {
      setError("This mode is available on pro plan only.")
      setShowUpgradeCta(true)
      router.push(`/pricing?next=${encodeURIComponent(`/subjects/${subjectId}`)}`)
      return
    }

    if (chapterIds.length === 0) {
      setError("Please select at least one chapter")
      return
    }

    setIsLoading(true)
    setError(null)
    setShowUpgradeCta(false)

    try {
      const mcqCount =
        mode === "MCQ" ? Number.parseInt(count, 10) : mode === "MIXED" ? Number.parseInt(mixedMcqCount, 10) : 0
      const cqCount =
        mode === "CQ" ? Number.parseInt(count, 10) : mode === "MIXED" ? Number.parseInt(mixedCqCount, 10) : 0

      const response = await generatePractice({
        exam_type_id: examTypeId,
        subject_id: subjectId,
        selection: {
          type: "CHAPTERS",
          chapter_ids: chapterIds,
        },
        mode,
        mcq_count: mcqCount,
        cq_count: cqCount,
        language,
      })

      const query = response.warning?.message
        ? `?warning=${encodeURIComponent(response.warning.message)}`
        : ""

      router.push(`/practice/${response.practice_session_id}${query}`)
    } catch (err) {
      const entitlement = matchEntitlementErrorByExactMessage(err)
      if (entitlement) {
        setError(entitlement.message)
        setShowUpgradeCta(true)
      } else {
        setError(formatApiError(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isSelectDisabled = isLoading
  const isStartDisabled = disabled || isLoading

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
        {tag}
      </span>

      <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconTextClass}`} />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>

      <div className="space-y-4 mb-5 pt-4 border-t border-border">
        {mode !== "MIXED" ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Number of questions</Label>
            <Select value={count} onValueChange={setCount} disabled={isSelectDisabled}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(mode === "MCQ" ? mcqCountOptions : cqCountOptions).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">MCQ questions</Label>
              <Select value={mixedMcqCount} onValueChange={setMixedMcqCount} disabled={isSelectDisabled}>
                <SelectTrigger className="w-full h-9 text-sm">
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
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">CQ questions</Label>
              <Select value={mixedCqCount} onValueChange={setMixedCqCount} disabled={isSelectDisabled}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cqCountOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Language</Label>
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)} disabled={isSelectDisabled}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-xs text-destructive text-center mb-3">{error}</p>}

      {(showUpgradeCta || requiresProForMode) && (
        <Button variant="outline" className="w-full mb-3 bg-transparent" asChild>
          <Link href={`/pricing?next=${encodeURIComponent(`/subjects/${subjectId}`)}`}>See pro plan options</Link>
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center mb-3">You can pause anytime. Your progress is saved automatically.</p>

      <Button onClick={handleStartPractice} className="w-full gap-2 group-hover:bg-primary/90" disabled={isStartDisabled}>
        {requiresProForMode ? "Upgrade to Pro" : isLoading ? "Starting..." : "Start Practice"}
        {!isLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
      </Button>

      {disabled && (
        <p className="text-[10px] text-muted-foreground/70 text-center mt-2">Select chapters above to start practicing.</p>
      )}
    </div>
  )
}
