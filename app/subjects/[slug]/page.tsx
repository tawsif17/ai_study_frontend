"use client"

import { use, useEffect } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { SubjectDetailContent } from "@/components/subject-detail-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ApiClientError } from "@/lib/api/client"
import { useExamTypes, useQuestions, useSubjects } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const subjectId = Number.parseInt(slug, 10)

  if (Number.isNaN(subjectId)) {
    notFound()
  }

  return (
    <PageShell>
      <SubjectDetailWrapper subjectId={subjectId} />
    </PageShell>
  )
}

function SubjectDetailWrapper({ subjectId }: { subjectId: number }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const { examTypes, isLoading: examTypesLoading } = useExamTypes()
  const { subjects, isLoading: subjectsLoading, isError: subjectsError } = useSubjects("SSC", isAuthenticated)

  const sscExamType = examTypes?.find((et) => et.code === "SSC")
  const subject = subjects?.find((s) => s.id === subjectId)

  const { questions, isLoading: questionsLoading, isError: questionsError } = useQuestions(
    sscExamType && subject
      ? {
          exam_type_id: sscExamType.id,
          subject_id: subject.id,
        }
      : null,
    Boolean(isAuthenticated && sscExamType && subject)
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/subjects/${subjectId}`)}`)
    }
  }, [authLoading, isAuthenticated, router, subjectId])

  const isLoading = authLoading || examTypesLoading || subjectsLoading || questionsLoading
  const hasUnauthorized =
    (subjectsError instanceof ApiClientError && subjectsError.status === 401) ||
    (questionsError instanceof ApiClientError && questionsError.status === 401)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-48 w-full mb-8" />
        <div className="flex justify-center">
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (hasUnauthorized) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground mb-2">Please sign in to continue</h1>
        <p className="text-muted-foreground">Authorization token missing or invalid</p>
        <Button asChild>
          <Link href={`/login?next=${encodeURIComponent(`/subjects/${subjectId}`)}`}>Login</Link>
        </Button>
      </div>
    )
  }

  if (subjectsError || questionsError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">Unable to load subject</h1>
        <p className="text-muted-foreground">Please try again in a moment.</p>
      </div>
    )
  }

  if (!subject || !sscExamType) {
    notFound()
  }

  return (
    <SubjectDetailContent
      subjectId={subjectId}
      subjectName={subject.name}
      examTypeId={sscExamType.id}
      questionCount={questions?.length ?? 0}
    />
  )
}
