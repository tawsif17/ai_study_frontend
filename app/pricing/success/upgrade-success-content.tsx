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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Upgrade successful</CardTitle>
            <CardDescription>Your pro plan is now active. You now have access to pro-only practice modes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
              Plan updated to Pro.
            </div>
            <Button className="w-full" asChild>
              <Link href={nextPath}>Continue</Link>
            </Button>
            <Button className="w-full bg-transparent" variant="outline" asChild>
              <Link href="/subjects">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
