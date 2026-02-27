"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { SubjectCardDetailed } from "@/components/subject-card-detailed"
import { Breadcrumb } from "@/components/breadcrumb"
import { BookOpen } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ApiClientError } from "@/lib/api/client"
import { useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

export default function SubjectsPage() {
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
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Breadcrumb items={[{ label: "Subjects" }]} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
                Choose Your Subject
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Start practicing SSC Higher Math, Physics, or Chemistry with AI-powered mock tests and explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : isUnauthorized ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Authorization token missing or invalid</p>
            <Button asChild>
              <Link href="/login?next=%2Fsubjects">Login to continue</Link>
            </Button>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive">Unable to load subjects right now.</p>
          </div>
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCardDetailed key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No subjects available at this time.</p>
          </div>
        )}
      </section>

      <section className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">More subjects coming soon</h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re starting with Higher Math, Physics, and Chemistry for SSC. HSC, O-levels and A-levels content
              will be added next.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
