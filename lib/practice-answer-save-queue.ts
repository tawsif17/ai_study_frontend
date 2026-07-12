import { ApiClientError } from "@/lib/api/client"
import type { AnswerPayload } from "@/lib/api/types"

export type PracticeAnswerSaveStatus = "idle" | "saving" | "retrying" | "saved" | "failed"

export interface PracticeAnswerMutation {
  answer: AnswerPayload
  clientRevision: number
  practiceItemId: number
}

export interface PracticeAnswerSaveSnapshot {
  status: PracticeAnswerSaveStatus
  pendingCount: number
  error: unknown | null
}

interface PracticeAnswerSaveQueueOptions {
  save: (answer: AnswerPayload) => Promise<void>
  onStateChange?: (snapshot: PracticeAnswerSaveSnapshot) => void
  maxAutomaticRetries?: number
  retryDelaysMs?: number[]
  isRetryable?: (error: unknown) => boolean
}

interface FailedMutation {
  mutation: PracticeAnswerMutation
  error: unknown
}

export class PracticeAnswerSaveQueueError extends Error {
  readonly reason: "failed" | "disposed"
  readonly originalError: unknown

  constructor(reason: "failed" | "disposed", message: string, originalError: unknown = null) {
    super(message)
    this.name = "PracticeAnswerSaveQueueError"
    this.reason = reason
    this.originalError = originalError
  }
}

export function isRetryablePracticeAnswerSaveError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status === 408 || error.status === 429 || error.status >= 500
  }

  return error instanceof TypeError
}

function getPracticeItemId(answer: AnswerPayload): number {
  return answer.practice_item_id
}

export class PracticeAnswerSaveQueue {
  private readonly save: (answer: AnswerPayload) => Promise<void>
  private readonly onStateChange?: (snapshot: PracticeAnswerSaveSnapshot) => void
  private readonly maxAutomaticRetries: number
  private readonly retryDelaysMs: number[]
  private readonly isRetryable: (error: unknown) => boolean

  private revision = 0
  private active: PracticeAnswerMutation | null = null
  private failed: FailedMutation | null = null
  private latestByItem = new Map<number, PracticeAnswerMutation>()
  private pendingByItem = new Map<number, PracticeAnswerMutation>()
  private pendingOrder: number[] = []
  private manualRetryRevisions = new Set<number>()
  private flushWaiters = new Set<{
    resolve: () => void
    reject: (error: PracticeAnswerSaveQueueError) => void
  }>()
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private resolveRetryDelay: (() => void) | null = null
  private disposed = false
  private hasEdited = false
  private snapshot: PracticeAnswerSaveSnapshot = {
    status: "idle",
    pendingCount: 0,
    error: null,
  }

  constructor(options: PracticeAnswerSaveQueueOptions) {
    this.save = options.save
    this.onStateChange = options.onStateChange
    this.maxAutomaticRetries = options.maxAutomaticRetries ?? 2
    this.retryDelaysMs = options.retryDelaysMs ?? [500, 1000]
    this.isRetryable = options.isRetryable ?? isRetryablePracticeAnswerSaveError
  }

  getSnapshot(): PracticeAnswerSaveSnapshot {
    return this.snapshot
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  enqueue(answer: AnswerPayload): number {
    if (this.disposed) {
      throw new PracticeAnswerSaveQueueError("disposed", "The answer save queue is no longer active.")
    }

    const practiceItemId = getPracticeItemId(answer)
    const mutation: PracticeAnswerMutation = {
      answer,
      clientRevision: ++this.revision,
      practiceItemId,
    }

    this.hasEdited = true
    this.latestByItem.set(practiceItemId, mutation)

    if (this.failed?.mutation.practiceItemId === practiceItemId) {
      this.failed = { ...this.failed, mutation }
      this.emit("failed", this.failed.error)
      return mutation.clientRevision
    }

    this.queueMutation(mutation)

    if (!this.failed) {
      this.emit(this.snapshot.status === "retrying" ? "retrying" : "saving")
      this.pump()
    } else {
      this.emit("failed", this.failed.error)
    }

    return mutation.clientRevision
  }

  retry(): boolean {
    if (this.disposed || !this.failed) return false

    const mutation = this.latestByItem.get(this.failed.mutation.practiceItemId) ?? this.failed.mutation
    this.failed = null
    this.removePendingItem(mutation.practiceItemId)
    this.pendingByItem.set(mutation.practiceItemId, mutation)
    this.pendingOrder.unshift(mutation.practiceItemId)
    this.manualRetryRevisions.add(mutation.clientRevision)
    this.emit("retrying")
    this.pump()
    return true
  }

  flush(): Promise<void> {
    if (this.disposed) {
      return Promise.reject(
        new PracticeAnswerSaveQueueError("disposed", "The answer save queue is no longer active.")
      )
    }

    if (this.failed) {
      return Promise.reject(
        new PracticeAnswerSaveQueueError(
          "failed",
          "One or more answers could not be saved.",
          this.failed.error
        )
      )
    }

    if (!this.active && this.pendingByItem.size === 0) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      this.flushWaiters.add({ resolve, reject })
    })
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.resolveRetryDelay?.()
    this.resolveRetryDelay = null

    const error = new PracticeAnswerSaveQueueError(
      "disposed",
      "The answer save queue was disposed before it finished."
    )
    for (const waiter of this.flushWaiters) waiter.reject(error)
    this.flushWaiters.clear()
    this.pendingByItem.clear()
    this.pendingOrder = []
  }

  private queueMutation(mutation: PracticeAnswerMutation): void {
    if (!this.pendingByItem.has(mutation.practiceItemId)) {
      this.pendingOrder.push(mutation.practiceItemId)
    }
    this.pendingByItem.set(mutation.practiceItemId, mutation)
  }

  private removePendingItem(practiceItemId: number): void {
    this.pendingByItem.delete(practiceItemId)
    this.pendingOrder = this.pendingOrder.filter((itemId) => itemId !== practiceItemId)
  }

  private pump(): void {
    if (this.disposed || this.active || this.failed) return

    let nextMutation: PracticeAnswerMutation | undefined
    while (this.pendingOrder.length > 0 && !nextMutation) {
      const practiceItemId = this.pendingOrder.shift()!
      nextMutation = this.pendingByItem.get(practiceItemId)
      this.pendingByItem.delete(practiceItemId)
    }

    if (!nextMutation) {
      this.emit(this.hasEdited ? "saved" : "idle")
      this.resolveFlushWaiters()
      return
    }

    this.active = nextMutation
    const isManualRetry = this.manualRetryRevisions.delete(nextMutation.clientRevision)
    void this.runMutation(nextMutation, isManualRetry)
  }

  private async runMutation(mutation: PracticeAnswerMutation, isManualRetry: boolean): Promise<void> {
    for (let attempt = 0; attempt <= this.maxAutomaticRetries; attempt += 1) {
      if (this.disposed) return

      if (this.isSuperseded(mutation)) {
        this.active = null
        this.pump()
        return
      }

      this.emit(isManualRetry || attempt > 0 ? "retrying" : "saving")

      try {
        await this.save(mutation.answer)
        if (this.disposed) return

        this.active = null
        this.pump()
        return
      } catch (error) {
        if (this.disposed) return

        if (this.isSuperseded(mutation)) {
          this.active = null
          this.pump()
          return
        }

        if (this.isRetryable(error) && attempt < this.maxAutomaticRetries) {
          this.emit("retrying")
          await this.waitForRetry(this.retryDelaysMs[attempt] ?? this.retryDelaysMs.at(-1) ?? 1000)
          continue
        }

        const latestMutation = this.latestByItem.get(mutation.practiceItemId) ?? mutation
        this.active = null
        this.failed = { mutation: latestMutation, error }
        this.emit("failed", error)
        this.rejectFlushWaiters(error)
        return
      }
    }
  }

  private isSuperseded(mutation: PracticeAnswerMutation): boolean {
    const latest = this.latestByItem.get(mutation.practiceItemId)
    return Boolean(latest && latest.clientRevision > mutation.clientRevision)
  }

  private waitForRetry(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
      const finish = () => {
        this.retryTimer = null
        this.resolveRetryDelay = null
        resolve()
      }
      this.resolveRetryDelay = finish
      this.retryTimer = setTimeout(finish, delayMs)
    })
  }

  private emit(status: PracticeAnswerSaveStatus, error: unknown | null = null): void {
    if (this.disposed) return
    this.snapshot = {
      status,
      pendingCount:
        this.pendingByItem.size + (this.active ? 1 : 0) + (this.failed ? 1 : 0),
      error,
    }
    this.onStateChange?.(this.snapshot)
  }

  private resolveFlushWaiters(): void {
    for (const waiter of this.flushWaiters) waiter.resolve()
    this.flushWaiters.clear()
  }

  private rejectFlushWaiters(originalError: unknown): void {
    const error = new PracticeAnswerSaveQueueError(
      "failed",
      "One or more answers could not be saved.",
      originalError
    )
    for (const waiter of this.flushWaiters) waiter.reject(error)
    this.flushWaiters.clear()
  }
}
