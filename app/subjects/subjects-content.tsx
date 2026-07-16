"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleHelp } from "lucide-react"
import { SubjectCardDetailed } from "@/components/subject-card-detailed"
import { AlertCircle, BookOpen, type IconComponent } from "@/components/icons"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  betaSubjects,
  findCatalogSubjectForBetaKey,
  getBetaSubjectKey,
  type BetaSubjectKey,
} from "@/lib/beta-subjects"
import { ApiClientError } from "@/lib/api/client"
import { useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

export function SubjectsContent({ selectedSubjectValue = null }: { selectedSubjectValue?: string | null }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const selectedKey = getBetaSubjectKey(selectedSubjectValue)
  const { subjects, isLoading: subjectsLoading, isError } = useSubjects("SSC", isAuthenticated)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const handledResumeKey = useRef<BetaSubjectKey | null>(null)

  useEffect(() => {
    handledResumeKey.current = null
    setResumeError(null)
  }, [selectedKey])

  useEffect(() => {
    if (!isAuthenticated || !selectedKey || subjectsLoading || isError || !subjects) {
      return
    }

    if (handledResumeKey.current === selectedKey) {
      return
    }

    handledResumeKey.current = selectedKey
    const selectedSubject = findCatalogSubjectForBetaKey(subjects, selectedKey)

    if (!selectedSubject) {
      setResumeError("Your selected subject is not available right now. Please choose another subject.")
      return
    }

    router.replace(`/subjects/${selectedSubject.id}`)
  }, [isAuthenticated, isError, router, selectedKey, subjects, subjectsLoading])

  const isCatalogLoading = isAuthenticated && subjectsLoading
  const isUnauthorized = isError instanceof ApiClientError && isError.status === 401
  const isCatalogEmpty = isAuthenticated && !subjectsLoading && !isError && subjects?.length === 0

  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0)_72%)]">
        <div className="container mx-auto px-4 py-8 md:py-10 lg:px-14">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              MCQ practice available now
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Choose a subject to practice
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Start with available SSC MCQ practice. Choose a subject, then pick the chapter and practice type on the
              next step.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-8 md:py-10" aria-labelledby="available-subjects-heading">
        <div className="container mx-auto px-4 lg:px-14">
          <h2 id="available-subjects-heading" className="text-2xl font-bold text-foreground">
            Available subjects
          </h2>

          <div className="mt-4 md:mt-5">
            {isCatalogLoading ? (
              <SubjectGridSkeleton />
            ) : isUnauthorized ? (
              <CatalogMessage
                icon={AlertCircle}
                title="Please sign in again"
                description="Please sign in again to start a practice session."
                action={{ href: "/login?next=%2Fsubjects", label: "Login to continue" }}
              />
            ) : isError ? (
              <CatalogMessage
                icon={AlertCircle}
                title="Unable to load subjects"
                description="Please try again in a moment."
                action={{ href: "/subjects", label: "Try again" }}
                isError
              />
            ) : resumeError ? (
              <CatalogMessage
                icon={BookOpen}
                title="Unable to open that subject"
                description={resumeError}
                action={{ href: "/subjects", label: "Choose another subject" }}
              />
            ) : isCatalogEmpty ? (
              <CatalogMessage
                icon={BookOpen}
                title="No subjects available"
                description="No subjects are available right now. Please check back soon."
              />
            ) : (
              <SubjectGrid />
            )}
          </div>

          {!isCatalogLoading && !isError && !resumeError && !isCatalogEmpty && (
            <>
              <p className="mt-5 text-center text-sm text-muted-foreground md:text-base">
                More SSC subjects will be added as practice content becomes ready.
              </p>
              <NewHereStrip />
            </>
          )}
        </div>
      </section>
    </PageShell>
  )
}

function SubjectGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {betaSubjects.map((subject) => (
        <SubjectCardDetailed key={subject.key} subject={subject} />
      ))}
    </div>
  )
}

function SubjectGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10" role="status" aria-label="Loading subjects">
      {["one", "two", "three"].map((key) => (
        <Skeleton key={key} className="h-[318px] rounded-xl border border-border/60 bg-muted/70" />
      ))}
    </div>
  )
}

function NewHereStrip() {
  return (
    <aside className="mt-4 flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
          <CircleHelp className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">New here?</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Start with any subject, then choose the chapter and practice type. Beta Pro includes Board-only MCQ sets and Weak Area Analysis for more focused revision.
          </p>
        </div>
      </div>
      <Button variant="outline" className="w-full shrink-0 rounded-lg border-primary text-primary hover:bg-primary/5 sm:w-auto" asChild>
        <Link href="/how-it-works">How practice works</Link>
      </Button>
    </aside>
  )
}

function CatalogMessage({
  icon: Icon,
  title,
  description,
  action,
  isError = false,
}: {
  icon: IconComponent
  title: string
  description: string
  action?: { href: string; label: string }
  isError?: boolean
}) {
  const iconClass = isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
  const textClass = isError ? "text-destructive" : "text-muted-foreground"

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm" role={isError ? "alert" : undefined}>
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${textClass}`}>{description}</p>
      {action && (
        <Button className="mt-5" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
