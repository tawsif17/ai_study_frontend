"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { reportApplicationError } from "@/lib/telemetry"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportApplicationError("route", error.digest)
  }, [error.digest])

  return (
    <PageShell>
      <section className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl items-center px-4 py-12 text-center">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Temporary problem</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">We could not load this page</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Please try again. If the problem continues, return to the homepage and try once more later.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={reset}>Try again</Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
