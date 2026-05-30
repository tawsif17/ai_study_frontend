"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const DEFAULT_NEXT_PATH = "/subjects"

function normalizeNextPath(value: string | null): string {
  if (typeof value === "string" && value.startsWith("/")) {
    return value
  }
  return DEFAULT_NEXT_PATH
}

export function UpgradeSuccessContent() {
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get("next")), [searchParams])

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-lg border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Upgrade successful</CardTitle>
            <CardDescription>Your Pro plan is now active. Continue when you are ready to practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
              Plan updated to Pro.
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
