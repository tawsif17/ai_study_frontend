"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getSafeNextPath } from "@/lib/safe-next-path"

export function UpgradeSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, user } = useAuth()
  const nextPath = useMemo(() => getSafeNextPath(searchParams.get("next")), [searchParams])
  const [isMarkerChecked, setIsMarkerChecked] = useState(false)
  const [hasSessionConfirmation, setHasSessionConfirmation] = useState(false)

  useEffect(() => {
    const confirmedNextPath = sessionStorage.getItem("beta-pro-activation-confirmed")
    sessionStorage.removeItem("beta-pro-activation-confirmed")

    if (confirmedNextPath === nextPath) {
      setHasSessionConfirmation(true)
    }
    setIsMarkerChecked(true)
  }, [nextPath])

  useEffect(() => {
    if (isMarkerChecked && !isLoading && (!hasSessionConfirmation || user?.plan_tier !== "pro")) {
      router.replace(`/pricing?next=${encodeURIComponent(nextPath)}`)
    }
  }, [hasSessionConfirmation, isLoading, isMarkerChecked, nextPath, router, user?.plan_tier])

  if (!isMarkerChecked || isLoading || !hasSessionConfirmation || user?.plan_tier !== "pro") {
    return (
      <PageShell>
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12" role="status">
          Checking Beta Pro access...
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-lg border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Beta Pro activated</CardTitle>
            <CardDescription>Your Beta Pro access is active. Continue when you are ready to practise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
              Beta Pro access activated.
            </div>
            <Button className="w-full rounded-lg" asChild>
              <Link href={nextPath}>Continue</Link>
            </Button>
            <Button className="w-full rounded-lg bg-transparent" variant="outline" asChild>
              <Link href="/subjects">Go to subjects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
