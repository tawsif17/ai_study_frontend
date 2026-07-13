"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Info, RotateCcw } from "lucide-react"
import {
  AlertCircle,
  Atom,
  BookOpen,
  Calculator,
  ChevronRight,
  FlaskConical,
  Target,
  TrendingUp,
  type IconComponent,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import { generatePractice, matchEntitlementErrorByExactMessage, type WeaknessRankingEntry } from "@/lib/api"
import { useProgressDashboard } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const RETURN_PATH = "/dashboard/weak-areas"

const subjectOptions = [
  { key: "all", label: "All subjects", icon: BookOpen },
  { key: "general-math", label: "General Math", icon: Calculator },
  { key: "physics", label: "Physics", icon: Atom },
  { key: "chemistry", label: "Chemistry", icon: FlaskConical },
] as const

type SubjectKey = (typeof subjectOptions)[number]["key"]

const supportedSubjectAliases: Record<Exclude<SubjectKey, "all">, readonly string[]> = {
  "general-math": ["general math", "mathematics"],
  physics: ["physics"],
  chemistry: ["chemistry"],
}

function normalizeSubjectName(name: string) {
  return name.trim().toLowerCase()
}

function getSupportedSubjectKey(name: string): Exclude<SubjectKey, "all"> | null {
  const normalizedName = normalizeSubjectName(name)
  const match = Object.entries(supportedSubjectAliases).find(([, aliases]) =>
    aliases.includes(normalizedName)
  )
  return (match?.[0] as Exclude<SubjectKey, "all"> | undefined) ?? null
}

function isSupportedEntry(entry: WeaknessRankingEntry) {
  return getSupportedSubjectKey(entry.subject_name) !== null
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function normalizeAttemptCount(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

export function WeakAreasContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { dashboard, isLoading, isError, mutate } = useProgressDashboard(isAuthenticated)
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("all")
  const [isStarting, setIsStarting] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const unauthorized = isError instanceof ApiClientError && isError.status === 401

  useEffect(() => {
    if ((!authLoading && !isAuthenticated) || unauthorized) {
      router.push(`/login?next=${encodeURIComponent(RETURN_PATH)}`)
    }
  }, [authLoading, isAuthenticated, router, unauthorized])

  const supportedRanking = useMemo(
    () => dashboard?.weakness_ranking.filter(isSupportedEntry) ?? [],
    [dashboard]
  )

  const subjectIds = useMemo(() => {
    const ids = new Map<Exclude<SubjectKey, "all">, Set<number>>()
    for (const key of Object.keys(supportedSubjectAliases) as Array<Exclude<SubjectKey, "all">>) {
      ids.set(key, new Set())
    }
    for (const entry of supportedRanking) {
      const key = getSupportedSubjectKey(entry.subject_name)
      if (key) ids.get(key)?.add(entry.subject_id)
    }
    return ids
  }, [supportedRanking])

  const visibleRanking = useMemo(() => {
    if (selectedSubject === "all") return supportedRanking
    const ids = subjectIds.get(selectedSubject)
    return supportedRanking.filter((entry) => ids?.has(entry.subject_id))
  }, [selectedSubject, subjectIds, supportedRanking])

  const supportedRecommendation = useMemo(() => {
    const recommendation = dashboard?.recommendation
    if (!recommendation) return null
    return supportedRanking.some(
      (entry) => entry.subject_id === recommendation.generate_payload.subject_id
    )
      ? recommendation
      : null
  }, [dashboard, supportedRanking])

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % subjectOptions.length
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + subjectOptions.length) % subjectOptions.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = subjectOptions.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    setSelectedSubject(subjectOptions[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  const handleStartRecommendation = async () => {
    if (!dashboard?.recommendation || isStarting) return
    setIsStarting(true)
    setGenerationError(null)
    try {
      const response = await generatePractice(dashboard.recommendation.generate_payload)
      const warning = response.warning?.message
        ? `?warning=${encodeURIComponent(response.warning.message)}`
        : ""
      router.push(`/practice/${response.practice_session_id}${warning}`)
    } catch (error) {
      const entitlement = matchEntitlementErrorByExactMessage(error)
      setGenerationError(entitlement ? entitlement.message : formatApiError(error))
      setIsStarting(false)
    }
  }

  if (authLoading || (!isAuthenticated && !unauthorized)) return <WeakAreasSkeleton />

  if (unauthorized || !isAuthenticated) {
    return (
      <CenteredState
        icon={AlertCircle}
        heading="Please sign in again"
        body="Your session has ended. Sign in again to view your revision guide."
        action={<Button asChild><Link href={`/login?next=${encodeURIComponent(RETURN_PATH)}`}>Login to continue</Link></Button>}
      />
    )
  }

  if (isLoading) return <WeakAreasSkeleton />

  if (isError || !dashboard) {
    return (
      <CenteredState
        icon={AlertCircle}
        heading="We couldn’t load your weak areas"
        body="Your practice data is safe. Please try loading this page again."
        isError
        action={<Button type="button" onClick={() => void mutate()}><RotateCcw className="h-4 w-4" aria-hidden="true" />Retry</Button>}
      />
    )
  }

  const noData = dashboard.proficiency === null && supportedRanking.length === 0 && supportedRecommendation === null

  if (noData) {
    return (
      <CenteredState
        icon={BookOpen}
        heading="Your weak areas will appear here"
        body="Complete and submit an MCQ practice session to start building your revision guide."
        action={<Button asChild><Link href="/subjects">Choose a subject</Link></Button>}
      />
    )
  }

  return (
    <div className="bg-[linear-gradient(180deg,rgba(19,117,201,0.045),rgba(255,255,255,0)_34rem)]">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-12">
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="inline-flex rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Weak areas</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">Choose what to revise next</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Your recent MCQ results highlight chapters that may need more practice.</p>
          </div>
          {dashboard.proficiency && <ProficiencySummary score={dashboard.proficiency.score} trend={dashboard.proficiency.trend_vs_last_week} />}
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(19rem,0.9fr)] lg:items-start">
          <aside className="lg:col-start-2 lg:row-start-1">
            {supportedRecommendation ? (
              <RecommendationPanel
                label={supportedRecommendation.label}
                isStarting={isStarting}
                error={generationError}
                onStart={handleStartRecommendation}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <BookOpen className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-bold text-foreground">Choose your next practice</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Your chapter rankings are ready, but there is no recommended session available right now.</p>
                <Button variant="outline" className="mt-5" asChild><Link href="/subjects">Choose a subject</Link></Button>
              </div>
            )}
          </aside>

          <section className="min-w-0 lg:col-start-1 lg:row-start-1" aria-labelledby="chapter-performance-heading">
            <h2 id="chapter-performance-heading" className="text-2xl font-bold text-foreground">Chapter performance</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Filter by subject or review all ranked chapters.</p>

            <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-primary/20 bg-card p-1 sm:grid-cols-4" role="tablist" aria-label="Filter chapters by subject">
              {subjectOptions.map((subject, index) => (
                <button
                  key={subject.key}
                  ref={(node) => { tabRefs.current[index] = node }}
                  type="button"
                  role="tab"
                  id={`weak-areas-tab-${subject.key}`}
                  aria-controls="weak-areas-panel"
                  aria-selected={selectedSubject === subject.key}
                  tabIndex={selectedSubject === subject.key ? 0 : -1}
                  onClick={() => setSelectedSubject(subject.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn("min-h-11 rounded-lg px-2 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", selectedSubject === subject.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                >
                  {subject.label}
                </button>
              ))}
            </div>

            <div
              id="weak-areas-panel"
              className="mt-5"
              role="tabpanel"
              aria-labelledby={`weak-areas-tab-${selectedSubject}`}
              tabIndex={0}
            >
              {visibleRanking.length ? <ChapterList entries={visibleRanking} /> : (
                <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold text-foreground">No assessed chapters for {subjectOptions.find((item) => item.key === selectedSubject)?.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Complete and submit more MCQ practice for this subject, or return to all ranked chapters.</p>
                  <Button variant="outline" className="mt-5" onClick={() => setSelectedSubject("all")}>Show all subjects</Button>
                </div>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><TrendingUp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Lower accuracy appears first when enough questions have been attempted.</p>
          </section>

        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-4 text-sm leading-6 text-muted-foreground">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>Weak areas use submitted MCQ answers. Chapters with fewer than 5 attempted questions need more practice before assessment.</p>
        </div>
      </div>
    </div>
  )
}

function ProficiencySummary({ score, trend }: { score: number; trend: number | null }) {
  const safeScore = clampPercent(score)
  const safeTrend = trend !== null && Number.isFinite(trend) ? Math.round(trend) : null
  const trendText = safeTrend === null ? "Not enough recent data to compare yet." : safeTrend > 0 ? `+${safeTrend} points vs last week` : safeTrend < 0 ? `${safeTrend} points vs last week` : "No change vs last week"
  return (
    <section className="flex items-center gap-5" aria-label={`Overall MCQ proficiency ${safeScore} percent. ${trendText}`}>
      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${safeScore * 3.6}deg, var(--muted) 0deg)` }} aria-hidden="true">
        <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-background text-3xl font-bold text-foreground">{safeScore}%</div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Overall MCQ proficiency</h2>
        <p className={cn("mt-1 text-sm", safeTrend !== null && safeTrend > 0 ? "text-emerald-700" : "text-muted-foreground")}>{trendText}</p>
      </div>
    </section>
  )
}

function ChapterList({ entries }: { entries: WeaknessRankingEntry[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="hidden grid-cols-[1.15fr_1.25fr_0.8fr_1.35fr_0.55fr] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-semibold text-muted-foreground md:grid">
        <span>Subject</span><span>Chapter</span><span>Attempts</span><span>Accuracy</span><span className="text-right">Action</span>
      </div>
      <ul className="divide-y divide-border">
        {entries.map((entry) => <ChapterRow key={`${entry.subject_id}-${entry.chapter_id}`} entry={entry} />)}
      </ul>
    </div>
  )
}

function ChapterRow({ entry }: { entry: WeaknessRankingEntry }) {
  const subjectKey = getSupportedSubjectKey(entry.subject_name)
  const option = subjectOptions.find((subject) => subject.key === subjectKey)
  const Icon = option?.icon ?? BookOpen
  const lowData = Boolean(entry.message)
  const safeAccuracy = clampPercent(entry.accuracy)
  const attemptCount = normalizeAttemptCount(entry.questions_attempted)
  return (
    <li className="grid gap-4 px-4 py-5 md:grid-cols-[1.15fr_1.25fr_0.8fr_1.35fr_0.55fr] md:items-center md:px-5 md:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-sm font-semibold text-foreground">{option?.label ?? entry.subject_name}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground md:font-medium">{entry.chapter_name}</p>
        <p className="mt-1 text-xs text-muted-foreground md:hidden">{attemptCount} {attemptCount === 1 ? "question" : "questions"} attempted</p>
      </div>
      <span className="hidden text-sm text-muted-foreground md:block">{attemptCount} {attemptCount === 1 ? "question" : "questions"}</span>
      <div>
        {lowData ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground">More practice needed</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{entry.message}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3" role="progressbar" aria-label={`${entry.chapter_name} accuracy`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeAccuracy}>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${safeAccuracy}%` }} /></div>
            <span className="w-10 text-right text-sm font-semibold text-foreground">{safeAccuracy}%</span>
          </div>
        )}
      </div>
      <Link href={`/subjects/${entry.subject_id}`} className="inline-flex min-h-11 items-center justify-end gap-1 rounded-md text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={`Practise ${entry.chapter_name}`}>
        Practise <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </li>
  )
}

function RecommendationPanel({ label, isStarting, error, onStart }: { label: string; isStarting: boolean; error: string | null; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(145deg,rgba(19,117,201,0.07),rgba(255,255,255,0.92))] p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Target className="h-8 w-8" aria-hidden="true" /></div>
      <p className="mt-5 text-sm font-semibold text-primary">Your next step</p>
      <h2 className="mt-2 text-xl font-bold leading-7 text-foreground">{label}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Start a focused set from your lowest-scoring assessed chapter.</p>
      <Button type="button" className="mt-6 min-h-11 w-full" onClick={onStart} disabled={isStarting} aria-describedby={error ? "recommendation-error" : undefined}>{isStarting ? "Starting practice…" : "Start recommended practice"}</Button>
      {error && <p id="recommendation-error" className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Review your answers after the session.</p>
    </div>
  )
}

function CenteredState({ icon: Icon, heading, body, action, isError = false }: { icon: IconComponent; heading: string; body: string; action: ReactNode; isError?: boolean }) {
  return (
    <div className="container mx-auto flex min-h-[34rem] max-w-2xl items-center justify-center px-4 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm" role={isError ? "alert" : undefined}>
        <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-full", isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}><Icon className="h-7 w-7" aria-hidden="true" /></div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">{heading}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{body}</p>
        <div className="mt-6">{action}</div>
      </section>
    </div>
  )
}

function WeakAreasSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10" role="status" aria-label="Loading weak areas">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><Skeleton className="h-8 w-28" /><Skeleton className="mt-4 h-12 max-w-xl" /><Skeleton className="mt-3 h-6 max-w-2xl" /></div><Skeleton className="h-28 w-80 rounded-full" /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.75fr_0.9fr]"><div><Skeleton className="h-8 w-56" /><Skeleton className="mt-4 h-12 w-full rounded-xl" /><Skeleton className="mt-5 h-72 w-full rounded-xl" /></div><Skeleton className="h-96 w-full rounded-2xl" /></div>
      <span className="sr-only">Loading your revision guide.</span>
    </div>
  )
}
