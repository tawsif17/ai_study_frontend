"use client"

import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, CircleAlert, ExternalLink, FileText, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { removeBookmark } from "@/lib/api"
import { useChapters, useRevisionItems, useRevisionSummary } from "@/lib/api/hooks"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import type { RevisionListKind, RevisionQuestionMedia, RevisionReviewItem } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const RETURN_PATH = "/bookmarks"
const PAGE_SIZE = 20
const REVIEW_TABS: RevisionListKind[] = ["bookmarks", "mistakes"]

function tabFromSearch(value: string | null): RevisionListKind {
  return value === "mistakes" ? "mistakes" : "bookmarks"
}

export function BookmarksContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get("tab")
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [tab, setTab] = useState<RevisionListKind>(() => tabFromSearch(requestedTab))
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>()
  const [selectedChapterId, setSelectedChapterId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [removingQuestionId, setRemovingQuestionId] = useState<number | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const { summary, isLoading: summaryLoading, isError: summaryError, mutate: mutateSummary } = useRevisionSummary(isAuthenticated)
  const { chapters, isLoading: chaptersLoading } = useChapters(selectedSubjectId)
  const { revisionItems, isLoading: itemsLoading, isError: itemsError, mutate: mutateItems } = useRevisionItems(
    tab,
    { subject_id: selectedSubjectId, chapter_id: selectedChapterId, page, page_size: PAGE_SIZE },
    isAuthenticated
  )

  const unauthorized = [summaryError, itemsError].some(
    (error) => error instanceof ApiClientError && error.status === 401
  )

  useEffect(() => {
    if ((!authLoading && !isAuthenticated) || unauthorized) {
      router.replace(`/login?next=${encodeURIComponent(RETURN_PATH)}`)
    }
  }, [authLoading, isAuthenticated, router, unauthorized])

  useEffect(() => {
    const nextTab = tabFromSearch(requestedTab)
    setTab(nextTab)
    setPage(1)
  }, [requestedTab])

  const selectedSubject = useMemo(
    () => summary?.subjects.find((subject) => subject.subject_id === selectedSubjectId),
    [selectedSubjectId, summary?.subjects]
  )
  const bookmarkTotal = summary?.bookmark_total ?? 0
  const mistakeTotal = summary?.active_mistake_total ?? 0
  const totalPages = Math.max(1, Math.ceil((revisionItems?.total ?? 0) / PAGE_SIZE))

  const changeTab = (nextTab: RevisionListKind) => {
    setTab(nextTab)
    setPage(1)
    router.replace(nextTab === "mistakes" ? "/bookmarks?tab=mistakes" : "/bookmarks", { scroll: false })
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % REVIEW_TABS.length
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + REVIEW_TABS.length) % REVIEW_TABS.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = REVIEW_TABS.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    changeTab(REVIEW_TABS[nextIndex])
    tabRefs.current[nextIndex]?.focus()
  }

  const changeSubject = (value: string) => {
    setSelectedSubjectId(value === "all" ? undefined : Number(value))
    setSelectedChapterId(undefined)
    setPage(1)
  }

  const changeChapter = (value: string) => {
    setSelectedChapterId(value === "all" ? undefined : Number(value))
    setPage(1)
  }

  const handleRemove = async (questionId: number) => {
    if (removingQuestionId !== null) return
    setRemovingQuestionId(questionId)
    setRemoveError(null)
    try {
      await removeBookmark(questionId)
      const [nextItems] = await Promise.all([mutateItems(), mutateSummary()])
      if (page > 1 && nextItems?.items.length === 0) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (error) {
      setRemoveError(formatApiError(error))
    } finally {
      setRemovingQuestionId(null)
    }
  }

  if (authLoading || (!isAuthenticated && !unauthorized)) return <BookmarksSkeleton />

  if (unauthorized || !isAuthenticated) {
    return <CenteredState heading="Please sign in again" body="Your session has ended. Sign in again to view saved questions." />
  }

  if (summaryLoading) return <BookmarksSkeleton />

  if (summaryError || !summary) {
    return (
      <CenteredState
        heading="We couldn't load your saved questions"
        body="Your saved questions are safe. Please try again."
        action={<Button type="button" onClick={() => void mutateSummary()}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>}
      />
    )
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,rgba(19,117,201,0.045),rgba(255,255,255,0)_28rem)]">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="border-b border-border pb-5">
          <p className="inline-flex rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Your saved questions</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Bookmarks</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review questions you saved and the questions you answered incorrectly. Practice them again from a subject page.
          </p>
          <div className="mt-5 flex gap-1" role="tablist" aria-label="Saved-question categories">
            <TabButton ref={(node) => { tabRefs.current[0] = node }} kind="bookmarks" active={tab === "bookmarks"} count={bookmarkTotal} onClick={() => changeTab("bookmarks")} onKeyDown={(event) => handleTabKeyDown(event, 0)}>Bookmarks</TabButton>
            <TabButton ref={(node) => { tabRefs.current[1] = node }} kind="mistakes" active={tab === "mistakes"} count={mistakeTotal} onClick={() => changeTab("mistakes")} onKeyDown={(event) => handleTabKeyDown(event, 1)}>Mistakes</TabButton>
          </div>
        </header>

        <section className="mt-5 flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between" aria-label="Filter saved questions">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!selectedSubjectId} onClick={() => changeSubject("all")}>All subjects</FilterPill>
            {summary.subjects.map((subject) => (
              <FilterPill key={subject.subject_id} active={selectedSubjectId === subject.subject_id} onClick={() => changeSubject(String(subject.subject_id))}>
                {subject.subject_name}
                <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-xs text-muted-foreground">{tab === "bookmarks" ? subject.bookmark_count : subject.active_mistake_count}</span>
              </FilterPill>
            ))}
          </div>
          {selectedSubjectId && (
            <Select value={selectedChapterId ? String(selectedChapterId) : "all"} onValueChange={changeChapter} disabled={chaptersLoading}>
              <SelectTrigger className="h-10 w-full bg-card sm:w-56" aria-label="Filter by chapter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {selectedSubject?.subject_name ?? "subject"} chapters</SelectItem>
                {(chapters ?? []).map((chapter) => <SelectItem key={chapter.id} value={String(chapter.id)}>{chapter.chapter_name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </section>

        <section id="bookmarks-panel" className="mt-6" role="tabpanel" aria-labelledby={`bookmarks-tab-${tab}`} tabIndex={0}>
          {itemsLoading ? <ReviewListSkeleton /> : itemsError || !revisionItems ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center" role="alert">
              <CircleAlert className="mx-auto size-8 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-foreground">We couldn't load these questions</h2>
              <Button type="button" variant="outline" className="mt-4 bg-transparent" onClick={() => void mutateItems()}>Retry</Button>
            </div>
          ) : revisionItems.items.length === 0 ? (
            <EmptyReviewState tab={tab} subjectName={selectedSubject?.subject_name} />
          ) : (
            <>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{tab === "bookmarks" ? "Saved questions" : "Mistakes to revisit"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{revisionItems.total} {revisionItems.total === 1 ? "question" : "questions"}</p>
                </div>
                <p className="hidden text-sm text-muted-foreground sm:block">Page {page} of {totalPages}</p>
              </div>
              <div className="space-y-3">
                {revisionItems.items.map((item) => (
                  <ReviewCard
                    key={item.question_id}
                    item={item}
                    kind={tab}
                    isRemoving={removingQuestionId === item.question_id}
                    onRemove={() => void handleRemove(item.question_id)}
                  />
                ))}
              </div>
              {removeError && <p className="mt-3 text-sm text-destructive" role="alert">{removeError}</p>}
              {totalPages > 1 && (
                <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Saved-question pages">
                  <Button type="button" variant="outline" className="min-h-11 bg-transparent" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                    <ChevronLeft className="size-4" aria-hidden="true" />Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button type="button" variant="outline" className="min-h-11 bg-transparent" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                    Next<ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>

        {tab === "mistakes" && (
          <aside className="mt-6 flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-4 text-sm leading-6 text-muted-foreground">
            <BookmarkCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p>When you answer one of these questions correctly in a later MCQ session, it will be removed from Mistakes automatically.</p>
          </aside>
        )}
      </div>
    </main>
  )
}

function TabButton({ ref, kind, active, count, onClick, onKeyDown, children }: { ref: (node: HTMLButtonElement | null) => void; kind: RevisionListKind; active: boolean; count: number; onClick: () => void; onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void; children: string }) {
  return <button ref={ref} type="button" role="tab" id={`bookmarks-tab-${kind}`} aria-controls="bookmarks-panel" aria-selected={active} tabIndex={active ? 0 : -1} aria-label={`${children} ${count}`} onClick={onClick} onKeyDown={onKeyDown} className={cn("min-h-10 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{children}<span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground" aria-hidden="true">{count}</span></button>
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors", active ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>{children}</button>
}

function ReviewCard({ item, kind, isRemoving, onRemove }: { item: RevisionReviewItem; kind: RevisionListKind; isRemoving: boolean; onRemove: () => void }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{item.subject.name}</span>
          {item.chapter && <span className="text-muted-foreground">{item.chapter.name}</span>}
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Bookmark className="size-4 text-primary" aria-hidden="true" />{kind === "bookmarks" ? "Saved by you" : "Answered incorrectly"}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{item.stem_text?.trim() || "This question text is unavailable."}</h3>
      <RevisionMedia media={item.media} questionId={item.question_id} />
      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        <span className="mr-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">Correct answer</span>
        <span className="font-semibold">{item.correct_answer.label}.</span> {item.correct_answer.option_text}
      </div>
      <section className="mt-3" aria-label="Explanation">
        <h4 className="text-sm font-semibold text-foreground">Explanation</h4>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.explanation?.trim() || "No explanation is available for this question yet."}</p>
      </section>
      {kind === "bookmarks" && (
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button type="button" variant="ghost" size="sm" className="min-h-10 gap-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive" onClick={onRemove} disabled={isRemoving}>
            <Trash2 className="size-4" aria-hidden="true" />{isRemoving ? "Removing..." : "Remove bookmark"}
          </Button>
        </div>
      )}
    </article>
  )
}

function safeMediaUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}

function RevisionMedia({ media, questionId }: { media: RevisionQuestionMedia[]; questionId: number }) {
  const visibleMedia = media.flatMap((asset) => {
    const url = safeMediaUrl(asset.public_url)
    return url ? [{ asset, url }] : []
  })
  if (visibleMedia.length === 0) return null

  return (
    <section className="mt-3 grid gap-3 sm:grid-cols-2" aria-label="Question media">
      {visibleMedia.map(({ asset, url }) => {
        const label = asset.caption?.trim() || `Question ${questionId} reference`
        const mediaType = asset.media_type.toUpperCase()
        if (mediaType === "IMAGE" || asset.mime_type?.startsWith("image/")) {
          return (
            <figure key={asset.link_id} className="overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
              <Image src={url} alt={label} width={1200} height={800} unoptimized className="mx-auto h-auto max-h-[32rem] w-auto max-w-full object-contain" />
              {asset.caption?.trim() && <figcaption className="px-2 pb-1 pt-2 text-center text-xs leading-5 text-muted-foreground">{asset.caption}</figcaption>}
            </figure>
          )
        }
        if (mediaType === "AUDIO" || asset.mime_type?.startsWith("audio/")) {
          return <audio key={asset.link_id} controls preload="none" className="w-full" aria-label={label}><source src={url} type={asset.mime_type ?? undefined} />Your browser does not support this audio.</audio>
        }
        return (
          <a key={asset.link_id} href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-primary hover:border-primary/50 hover:bg-primary/5">
            <FileText className="size-4" aria-hidden="true" />{asset.caption?.trim() || "Open question document"}<ExternalLink className="ml-auto size-4" aria-hidden="true" />
          </a>
        )
      })}
    </section>
  )
}

function EmptyReviewState({ tab, subjectName }: { tab: RevisionListKind; subjectName?: string }) {
  const isBookmarks = tab === "bookmarks"
  return <div className="rounded-2xl border border-border bg-card p-10 text-center"><Bookmark className="mx-auto size-9 text-primary" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold text-foreground">{isBookmarks ? "No bookmarks here yet" : "No active mistakes here"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{subjectName ? `There are no ${isBookmarks ? "bookmarks" : "active mistakes"} for ${subjectName} with this filter.` : isBookmarks ? "Save any MCQ during practice or results to revisit it later." : "Incorrect submitted MCQ answers will appear here until you answer them correctly."}</p><Button asChild className="mt-5"><Link href="/subjects">Choose a subject</Link></Button></div>
}

function CenteredState({ heading, body, action }: { heading: string; body: string; action?: React.ReactNode }) {
  return <div className="container mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 text-center"><CircleAlert className="size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-2xl font-bold text-foreground">{heading}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p><div className="mt-5">{action}</div></div>
}

function BookmarksSkeleton() {
  return <div className="container mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-7 w-36" /><Skeleton className="mt-4 h-11 w-56" /><Skeleton className="mt-3 h-5 w-full max-w-2xl" /><Skeleton className="mt-8 h-11 w-72" /><ReviewListSkeleton /></div>
}

function ReviewListSkeleton() {
  return <div className="mt-6 space-y-3">{[1, 2, 3].map((index) => <Skeleton key={index} className="h-48 w-full" />)}</div>
}
