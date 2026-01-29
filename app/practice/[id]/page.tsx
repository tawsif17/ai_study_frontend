"use client"

import { use } from "react"
import { notFound, useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { PracticeSessionContent } from "@/components/practice-session-content"
import { PracticeResultsContent } from "@/components/practice-results-content"
import { Skeleton } from "@/components/ui/skeleton"
import { usePracticeSummary } from "@/lib/api/practice-hooks"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const practiceId = Number.parseInt(id, 10)

  // Handle non-numeric ids
  if (Number.isNaN(practiceId)) {
    notFound()
  }

  return (
    <PageShell>
      <PracticeSessionWrapper practiceId={practiceId} />
    </PageShell>
  )
}

function PracticeSessionWrapper({ practiceId }: { practiceId: number }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { summary, isLoading, isError } = usePracticeSummary(practiceId)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-32 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">Practice session not found</h1>
        <p className="text-muted-foreground">This practice session may have expired or does not exist.</p>
      </div>
    )
  }

  // Show results if the session is submitted
  if (summary.attempt_status === "SUBMITTED") {
    return <PracticeResultsContent practiceId={practiceId} summary={summary} />
  }

  // Show practice content if in progress
  return <PracticeSessionContent practiceId={practiceId} summary={summary} />
}
