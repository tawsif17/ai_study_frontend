"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { saveAnswers } from "@/lib/api"
import type { AnswerPayload, StoredAnswer } from "@/lib/api/types"
import {
  PracticeAnswerSaveQueue,
  type PracticeAnswerSaveSnapshot,
} from "@/lib/practice-answer-save-queue"

const INITIAL_SNAPSHOT: PracticeAnswerSaveSnapshot = {
  status: "idle",
  pendingCount: 0,
  error: null,
}

function storedAnswerValue(answer: StoredAnswer): string | null {
  return answer.answer_type === "MCQ" ? answer.selected_option_label : answer.cq_text
}

function payloadAnswerValue(answer: AnswerPayload): string {
  return answer.answer_type === "MCQ" ? answer.selected_option_label : answer.cq_text
}

interface UsePracticeAnswerSaveQueueOptions {
  practiceId: number
  savedAnswers: StoredAnswer[] | undefined
}

export function usePracticeAnswerSaveQueue({
  practiceId,
  savedAnswers,
}: UsePracticeAnswerSaveQueueOptions) {
  const [serverAnswers, setServerAnswers] = useState<Map<number, string>>(new Map())
  const [localAnswers, setLocalAnswers] = useState<Map<number, string>>(new Map())
  const [snapshot, setSnapshot] = useState<PracticeAnswerSaveSnapshot>(INITIAL_SNAPSHOT)
  const mountedRef = useRef(true)
  const queueRef = useRef<{ practiceId: number; queue: PracticeAnswerSaveQueue } | null>(null)

  const ensureQueue = useCallback(() => {
    const current = queueRef.current
    if (current && current.practiceId === practiceId && !current.queue.isDisposed) {
      return current.queue
    }

    const queue = new PracticeAnswerSaveQueue({
      save: async (answer) => {
        const response = await saveAnswers(practiceId, { answers: [answer] })
        if (!response.saved) throw new Error("The server did not confirm that the answer was saved.")
      },
      onStateChange: (nextSnapshot) => {
        if (mountedRef.current) setSnapshot(nextSnapshot)
      },
    })
    queueRef.current = { practiceId, queue }
    return queue
  }, [practiceId])

  useEffect(() => {
    mountedRef.current = true
    const queue = ensureQueue()

    return () => {
      mountedRef.current = false
      queue.dispose()
      if (queueRef.current?.queue === queue) queueRef.current = null
    }
  }, [ensureQueue])

  useEffect(() => {
    const nextServerAnswers = new Map<number, string>()
    for (const answer of savedAnswers ?? []) {
      const value = storedAnswerValue(answer)
      if (value) nextServerAnswers.set(answer.practice_item_id, value)
    }
    setServerAnswers(nextServerAnswers)
  }, [savedAnswers])

  useEffect(() => {
    setLocalAnswers(new Map())
    setSnapshot(INITIAL_SNAPSHOT)
  }, [practiceId])

  const answers = useMemo(() => {
    const combined = new Map(serverAnswers)
    for (const [practiceItemId, value] of localAnswers) {
      combined.set(practiceItemId, value)
    }
    return combined
  }, [localAnswers, serverAnswers])

  const setAnswer = useCallback(
    (answer: AnswerPayload) => {
      setLocalAnswers((current) => {
        const next = new Map(current)
        next.set(answer.practice_item_id, payloadAnswerValue(answer))
        return next
      })
      return ensureQueue().enqueue(answer)
    },
    [ensureQueue]
  )

  const retry = useCallback(() => ensureQueue().retry(), [ensureQueue])
  const flush = useCallback(() => ensureQueue().flush(), [ensureQueue])

  return {
    answers,
    status: snapshot.status,
    saveError: snapshot.error,
    pendingCount: snapshot.pendingCount,
    hasUnsavedWork: ["saving", "retrying", "failed"].includes(snapshot.status),
    setAnswer,
    retry,
    flush,
  }
}
