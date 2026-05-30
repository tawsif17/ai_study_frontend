"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { SubjectCardDetailed } from "@/components/subject-card-detailed"
import { Breadcrumb } from "@/components/breadcrumb"
import { AlertCircle, BookOpen } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ApiClientError } from "@/lib/api/client"
import { useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

export function SubjectsContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { subjects, isLoading: subjectsLoading, isError } = useSubjects("SSC", isAuthenticated)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?next=%2Fsubjects")
    }
  }, [authLoading, isAuthenticated, router])

  const isLoading = authLoading || subjectsLoading
  const isUnauthorized = isError instanceof ApiClientError && isError.status === 401

  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0))]">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Breadcrumb items={[{ label: "Subjects" }]} />
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Subject library</p>
              <h1 className="mb-4 text-3xl font-bold text-foreground text-balance md:text-4xl lg:text-5xl">
                Choose an SSC science subject
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Start practicing Higher Math, Physics, or Chemistry with guided sessions and explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading subjects">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl border border-border/60 bg-muted/70" />
            ))}
          </div>
        ) : isUnauthorized ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <AlertCircle className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <p className="mb-4 text-muted-foreground">Please sign in again to view your subjects.</p>
            <Button asChild>
              <Link href="/login?next=%2Fsubjects">Login to continue</Link>
            </Button>
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm" role="alert">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <p className="text-destructive">Unable to load subjects right now.</p>
          </div>
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCardDetailed key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <BookOpen className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground">No subjects available at this time.</p>
          </div>
        )}
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">More subjects coming soon</h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re starting with Higher Math, Physics, and Chemistry for SSC. Additional subject coverage will be
              added as it becomes ready.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
