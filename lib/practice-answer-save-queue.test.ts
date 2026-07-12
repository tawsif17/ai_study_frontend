import { afterEach, describe, expect, it, vi } from "vitest"
import {
  PracticeAnswerSaveQueue,
  PracticeAnswerSaveQueueError,
  isRetryablePracticeAnswerSaveError,
  type PracticeAnswerSaveSnapshot,
} from "./practice-answer-save-queue"
import type { AnswerPayload } from "@/lib/api/types"
import { ApiClientError } from "@/lib/api/client"

function mcqAnswer(practiceItemId: number, label: string): AnswerPayload {
  return {
    practice_item_id: practiceItemId,
    answer_type: "MCQ",
    selected_option_label: label,
  }
}

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

async function settleMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

describe("PracticeAnswerSaveQueue", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([408, 429, 500, 503])("retries HTTP %i save failures", (status) => {
    expect(
      isRetryablePracticeAnswerSaveError(new ApiClientError({ message: "Temporary failure" }, status))
    ).toBe(true)
  })

  it.each([400, 401, 403, 404, 409])("does not automatically retry HTTP %i save failures", (status) => {
    expect(
      isRetryablePracticeAnswerSaveError(new ApiClientError({ message: "Terminal failure" }, status))
    ).toBe(false)
  })

  it("serializes rapid changes and coalesces the queued value to the latest answer", async () => {
    const first = deferred()
    const second = deferred()
    let activeRequests = 0
    let maxActiveRequests = 0
    const save = vi.fn(async () => {
      activeRequests += 1
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests)
      const current = save.mock.calls.length === 1 ? first : second
      await current.promise
      activeRequests -= 1
    })
    const queue = new PracticeAnswerSaveQueue({ save })

    queue.enqueue(mcqAnswer(7, "A"))
    queue.enqueue(mcqAnswer(7, "B"))
    queue.enqueue(mcqAnswer(7, "C"))

    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenNthCalledWith(1, mcqAnswer(7, "A"))

    first.resolve()
    await settleMicrotasks()

    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenNthCalledWith(2, mcqAnswer(7, "C"))
    expect(queue.getSnapshot().status).toBe("saving")

    second.resolve()
    await queue.flush()

    expect(maxActiveRequests).toBe(1)
    expect(queue.getSnapshot()).toMatchObject({ status: "saved", pendingCount: 0 })
  })

  it("keeps deterministic FIFO order across items while coalescing each item", async () => {
    const requests = [deferred(), deferred(), deferred(), deferred()]
    const save = vi.fn(async () => {
      await requests[save.mock.calls.length - 1].promise
    })
    const queue = new PracticeAnswerSaveQueue({ save })

    queue.enqueue(mcqAnswer(1, "A"))
    queue.enqueue(mcqAnswer(2, "A"))
    queue.enqueue(mcqAnswer(1, "B"))
    queue.enqueue(mcqAnswer(3, "D"))

    requests[0].resolve()
    await settleMicrotasks()
    expect(save).toHaveBeenNthCalledWith(2, mcqAnswer(2, "A"))

    requests[1].resolve()
    await settleMicrotasks()
    expect(save).toHaveBeenNthCalledWith(3, mcqAnswer(1, "B"))

    requests[2].resolve()
    await settleMicrotasks()

    expect(save).toHaveBeenCalledTimes(4)
    expect(save).toHaveBeenNthCalledWith(4, mcqAnswer(3, "D"))
    requests[3].resolve()
    await queue.flush()
    expect(queue.getSnapshot().status).toBe("saved")
  })

  it("shows retrying and succeeds within the bounded automatic retry budget", async () => {
    vi.useFakeTimers()
    const snapshots: PracticeAnswerSaveSnapshot[] = []
    const save = vi
      .fn<(answer: AnswerPayload) => Promise<void>>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockRejectedValueOnce(new TypeError("still offline"))
      .mockResolvedValueOnce()
    const queue = new PracticeAnswerSaveQueue({
      save,
      onStateChange: (snapshot) => snapshots.push(snapshot),
    })

    queue.enqueue(mcqAnswer(7, "A"))
    await settleMicrotasks()
    expect(queue.getSnapshot().status).toBe("retrying")

    await vi.advanceTimersByTimeAsync(500)
    expect(save).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1000)
    await queue.flush()

    expect(save).toHaveBeenCalledTimes(3)
    expect(snapshots.some((snapshot) => snapshot.status === "retrying")).toBe(true)
    expect(queue.getSnapshot().status).toBe("saved")
  })

  it("stops after three attempts, preserves failure, and succeeds after explicit retry", async () => {
    vi.useFakeTimers()
    const save = vi
      .fn<(answer: AnswerPayload) => Promise<void>>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce()
    const queue = new PracticeAnswerSaveQueue({ save })

    queue.enqueue(mcqAnswer(7, "A"))
    await vi.runAllTimersAsync()
    await settleMicrotasks()

    expect(save).toHaveBeenCalledTimes(3)
    expect(queue.getSnapshot().status).toBe("failed")
    await expect(queue.flush()).rejects.toMatchObject({
      reason: "failed",
    } satisfies Partial<PracticeAnswerSaveQueueError>)

    expect(queue.retry()).toBe(true)
    await queue.flush()

    expect(save).toHaveBeenCalledTimes(4)
    expect(queue.getSnapshot().status).toBe("saved")
  })

  it("skips retrying an obsolete failure and sends the newer local revision", async () => {
    vi.useFakeTimers()
    const first = deferred()
    const save = vi
      .fn<(answer: AnswerPayload) => Promise<void>>()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce()
    const queue = new PracticeAnswerSaveQueue({ save })

    queue.enqueue(mcqAnswer(7, "A"))
    queue.enqueue(mcqAnswer(7, "B"))
    first.reject(new TypeError("slow request failed"))
    await settleMicrotasks()

    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith(mcqAnswer(7, "B"))
    await queue.flush()
    expect(queue.getSnapshot().status).toBe("saved")
  })

  it("disposes retry timers and does not start another request after unmount", async () => {
    vi.useFakeTimers()
    const save = vi.fn<(answer: AnswerPayload) => Promise<void>>().mockRejectedValue(new TypeError("offline"))
    const queue = new PracticeAnswerSaveQueue({ save })

    queue.enqueue(mcqAnswer(7, "A"))
    await settleMicrotasks()
    expect(queue.getSnapshot().status).toBe("retrying")

    queue.dispose()
    await vi.runAllTimersAsync()

    expect(save).toHaveBeenCalledTimes(1)
  })
})
