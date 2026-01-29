"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { SubjectDetailContent } from "@/components/subject-detail-content"
import { Skeleton } from "@/components/ui/skeleton"
import { useExamTypes, useSubjects } from "@/lib/api/hooks"

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const subjectId = Number.parseInt(slug, 10)

  // Handle non-numeric slugs
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
  const { examTypes, isLoading: examTypesLoading } = useExamTypes()
  const sscExamType = examTypes?.find((et) => et.code === "SSC")
  const { subjects, isLoading: subjectsLoading } = useSubjects(sscExamType?.id)
  
  const isLoading = examTypesLoading || subjectsLoading
  const subject = subjects?.find((s) => s.id === subjectId)

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

  if (!subject) {
    notFound()
  }

  return (
    <SubjectDetailContent 
      subjectId={subjectId} 
      subjectName={subject.name}
      examTypeId={sscExamType!.id}
    />
  )
}
