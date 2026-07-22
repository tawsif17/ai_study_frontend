import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ApiAbortError,
  ApiClientError,
  ApiContractError,
  ApiNetworkError,
  ApiTimeoutError,
  apiClient,
  formatApiError,
} from "./client"

function response({
  ok = true,
  status = 200,
  json,
}: {
  ok?: boolean
  status?: number
  json: () => Promise<unknown>
}): Response {
  return { ok, status, json } as Response
}

describe("apiClient failure classification", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("times out after the configured duration", async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
        })
      )
    )

    const request = apiClient("/slow", { timeoutMs: 25 })
    const rejection = expect(request).rejects.toBeInstanceOf(ApiTimeoutError)
    await vi.advanceTimersByTimeAsync(25)

    await rejection
  })

  it("distinguishes caller cancellation from timeout", async () => {
    const controller = new AbortController()
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
        })
      )
    )

    const request = apiClient("/cancelled", { signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toBeInstanceOf(ApiAbortError)
  })

  it("keeps the timeout active while the response body is being read", async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) =>
        Promise.resolve(
          response({
            json: () =>
              new Promise((_resolve, reject) => {
                init.signal?.addEventListener("abort", () =>
                  reject(new DOMException("Aborted", "AbortError"))
                )
              }),
          })
        )
      )
    )

    const request = apiClient("/slow-body", { timeoutMs: 25 })
    const rejection = expect(request).rejects.toBeInstanceOf(ApiTimeoutError)
    await vi.advanceTimersByTimeAsync(25)

    await rejection
  })

  it("wraps fetch failures as network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch secret.example")))

    const error = await apiClient("/offline").catch((caught) => caught)
    expect(error).toBeInstanceOf(ApiNetworkError)
    expect(formatApiError(error)).toBe(
      "We could not reach Shikkha Buddy. Check your connection and try again."
    )
    expect(formatApiError(error)).not.toContain("secret.example")
  })

  it("turns malformed successful JSON into a contract error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ json: () => Promise.reject(new SyntaxError("bad json")) }))
    )

    await expect(apiClient("/malformed")).rejects.toBeInstanceOf(ApiContractError)
  })

  it("keeps actionable 4xx messages but hides backend 5xx details", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response({
            ok: false,
            status: 403,
            json: async () => ({ message: "Email verification required" }),
          })
        )
        .mockResolvedValueOnce(
          response({
            ok: false,
            status: 500,
            json: async () => ({ message: "database host and password leaked" }),
          })
        )
    )

    const forbidden = await apiClient("/forbidden").catch((caught) => caught)
    const serverFailure = await apiClient("/server-error").catch((caught) => caught)

    expect(forbidden).toBeInstanceOf(ApiClientError)
    expect(formatApiError(forbidden)).toBe("Email verification required")
    expect(formatApiError(serverFailure)).toBe("Something went wrong. Please try again.")
  })
})
