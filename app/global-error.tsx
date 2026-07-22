"use client"

import { useEffect } from "react"
import Link from "next/link"
import { reportApplicationError } from "@/lib/telemetry"

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportApplicationError("root", error.digest)
  }, [error.digest])

  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12 text-center">
          <section className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm" aria-labelledby="root-error-heading">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Temporary problem</p>
            <h1 id="root-error-heading" className="mt-3 text-3xl font-bold tracking-tight">Shikkha Buddy could not start</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Try loading the app again. If the problem continues, return to the homepage and try later.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={reset} className="min-h-11 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground">
                Try again
              </button>
              <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 font-medium">
                Go to homepage
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
