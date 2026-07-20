"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { saveBookmark } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"

interface BookmarkPracticeItemButtonProps {
  practiceItemId: number
  compact?: boolean
}

export function BookmarkPracticeItemButton({
  practiceItemId,
  compact = false,
}: BookmarkPracticeItemButtonProps) {
  const { mutate } = useSWRConfig()
  const currentPracticeItemId = useRef(practiceItemId)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    currentPracticeItemId.current = practiceItemId
    setIsSaved(false)
    setIsSaving(false)
    setError(null)
  }, [practiceItemId])

  const handleSave = async () => {
    if (isSaved || isSaving) return
    const requestedPracticeItemId = practiceItemId
    setIsSaving(true)
    setError(null)
    try {
      await saveBookmark(requestedPracticeItemId)
      if (currentPracticeItemId.current === requestedPracticeItemId) {
        setIsSaved(true)
      }
      void mutate("revision-summary")
      void mutate((key) => Array.isArray(key) && key[0] === "revision-items")
    } catch (saveError) {
      if (currentPracticeItemId.current === requestedPracticeItemId) {
        setError(formatApiError(saveError))
      }
    } finally {
      if (currentPracticeItemId.current === requestedPracticeItemId) {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size={compact ? "sm" : "default"}
        className="min-h-10 gap-2 text-primary hover:bg-primary/5 hover:text-primary"
        onClick={() => void handleSave()}
        disabled={isSaved || isSaving}
      >
        {isSaved ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
        {isSaved ? "Bookmarked" : isSaving ? "Saving..." : "Bookmark"}
      </Button>
      {error && <p className="max-w-56 text-right text-xs text-destructive" role="alert">{error}</p>}
    </div>
  )
}
