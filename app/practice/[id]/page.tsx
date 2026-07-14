"use client"

import { Suspense, use } from "react"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { PracticeSessionContent } from "@/components/practice-session-content"
import { PracticeResultsContent } from "@/components/practice-results-content"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { usePracticeSummary } from "@/lib/api/practice-hooks"
import { ApiClientError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const practiceId = parsePracticeId(id)

  if (practiceId === null) {
    notFound()
  }

  return (
    <PageShell>
      <Suspense fallback={<div className="container mx-auto px-4 py-12"><Skeleton className="h-32 w-full mb-8" /><Skeleton className="h-96 w-full" /></div>}>
        <PracticeSessionWrapper practiceId={practiceId} />
      </Suspense>
    </PageShell>
  )
}

export function parsePracticeId(id: string): number | null {
  const practiceId = Number(id)
  return Number.isSafeInteger(practiceId) && practiceId > 0 ? practiceId : null
}

export function PracticeSessionWrapper({ practiceId }: { practiceId: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const warning = searchParams.get("warning")
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { summary, isLoading, isError } = usePracticeSummary(practiceId, isAuthenticated)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`)
    }
  }, [authLoading, isAuthenticated, practiceId, router])

  useEffect(() => {
    if (isError instanceof ApiClientError && isError.status === 401) {
      router.push(`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`)
    }
  }, [isError, practiceId, router])

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12" role="status" aria-label="Loading practice session">
        <span className="sr-only">Loading practice session.</span>
        <Skeleton className="h-32 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground mb-2">Please sign in to continue</h1>
        <p className="text-muted-foreground">Please sign in again to continue practicing.</p>
        <Button asChild>
          <Link href={`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`}>Login</Link>
        </Button>
      </div>
    )
  }

  if (isError) {
    const status = isError instanceof ApiClientError ? isError.status : undefined
    const content = status === 401
      ? {
          heading: "Please sign in again",
          body: "Your session has expired. Sign in to return to this practice session.",
        }
      : status === 403
        ? {
            heading: "Practice session unavailable",
            body: "This practice session belongs to another account and cannot be opened here.",
          }
        : status === 404
          ? {
              heading: "Practice session not found",
              body: "This practice session may have expired or no longer exists.",
            }
          : {
              heading: "Unable to load practice session",
              body: "We could not load this practice session. Please try again shortly.",
            }

    return (
      <div className="container mx-auto px-4 py-12 text-center" role="alert">
        <h1 className="text-xl font-semibold text-foreground mb-2">{content.heading}</h1>
        <p className="text-muted-foreground">{content.body}</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          {status === 401 && (
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(`/practice/${practiceId}`)}`}>Go to login</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/subjects">Back to subjects</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="container mx-auto px-4 py-12 text-center" role="alert">
        <h1 className="text-xl font-semibold text-foreground mb-2">Unable to load practice session</h1>
        <p className="text-muted-foreground">No practice-session data was returned. Please try again shortly.</p>
      </div>
    )
  }

  // Show results if the session is submitted
  if (summary.attempt_status === "SUBMITTED") {
    return (
      <>
        {warning && (
          <div className="container mx-auto px-4 pt-6">
            <div className="p-3 rounded-lg bg-secondary border border-border text-sm text-foreground">{warning}</div>
          </div>
        )}
        <PracticeResultsContent practiceId={practiceId} summary={summary} />
      </>
    )
  }

  // Show practice content if in progress
  return (
    <>
      {warning && (
        <div className="container mx-auto px-4 pt-6">
          <div className="p-3 rounded-lg bg-secondary border border-border text-sm text-foreground">{warning}</div>
        </div>
      )}
      <PracticeSessionContent practiceId={practiceId} summary={summary} />
    </>
  )
}
