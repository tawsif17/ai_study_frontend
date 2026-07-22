import { Suspense } from "react"
import type { Metadata } from "next"
import { PageShell } from "@/components/page-shell"
import { BookmarksContent } from "@/components/bookmarks-content"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Bookmarks | Shikkha Buddy",
  robots: { index: false, follow: false },
}

export default function BookmarksPage() {
  return (
    <PageShell>
      <Suspense fallback={<BookmarksPageSkeleton />}>
        <BookmarksContent />
      </Suspense>
    </PageShell>
  )
}

function BookmarksPageSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="mt-4 h-11 w-56" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-8 h-11 w-72" />
      <Skeleton className="mt-6 h-48 w-full" />
    </div>
  )
}
