import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  ApiAbortError,
  ApiClientError,
  ApiContractError,
  ApiNetworkError,
  ApiTimeoutError,
  apiClient,
  clearSessionCredentials,
  formatApiError,
  removeLegacyAuthToken,
  runWithSessionTermination,
  setCsrfToken,
  subscribeToSessionInvalid,
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
  beforeEach(() => {
    clearSessionCredentials()
  })

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

  it("strictly validates required success envelopes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({ json: async () => ({ success: false, data: { user: {} } }) })
      )
      .mockResolvedValueOnce(
        response({ json: async () => ({ success: true, data: {}, extra: true }) })
      )
      .mockResolvedValueOnce(response({ json: async () => ({ user: {} }) }))
    vi.stubGlobal("fetch", fetchMock)

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(
        apiClient("/auth/me", { responseEnvelope: "required" })
      ).rejects.toBeInstanceOf(ApiContractError)
    }
  })

  it("does not let blocked legacy storage cleanup stop bootstrap", () => {
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new DOMException("Blocked", "SecurityError")
      })

    expect(() => removeLegacyAuthToken()).not.toThrow()
    expect(removeItem).toHaveBeenCalledWith("auth_token")
    removeItem.mockRestore()
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

describe("apiClient cookie session transport", () => {
  beforeEach(() => {
    clearSessionCredentials()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sends credentials without a bearer header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({ json: async () => ({ success: true, data: { user: {} } }) })
    )
    vi.stubGlobal("fetch", fetchMock)

    await apiClient("/auth/me", { auth: "required" })

    expect(fetchMock).toHaveBeenCalledOnce()
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.credentials).toBe("include")
    expect(init.headers).not.toHaveProperty("Authorization")
  })

  it("acquires one CSRF token and attaches it to an authenticated mutation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({ json: async () => ({ success: true, data: { csrfToken: "csrf-1" } }) })
      )
      .mockResolvedValueOnce(
        response({ json: async () => ({ success: true, data: { saved: true } }) })
      )
    vi.stubGlobal("fetch", fetchMock)

    await apiClient("/practice/42/answers", {
      method: "PATCH",
      body: { answers: [] },
      auth: "required",
    })

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3001/api/auth/csrf")
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "csrf-1",
      },
    })
  })

  it("deduplicates refresh and retries concurrent protected requests once", async () => {
    let protectedAttempts = 0
    let csrfAttempts = 0
    let refreshAttempts = 0
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/auth/csrf")) {
        csrfAttempts += 1
        return response({
          json: async () => ({ success: true, data: { csrfToken: "csrf-before-refresh" } }),
        })
      }
      if (url.endsWith("/auth/refresh")) {
        refreshAttempts += 1
        return response({
          json: async () => ({ success: true, data: { csrfToken: "csrf-after-refresh" } }),
        })
      }
      protectedAttempts += 1
      if (protectedAttempts <= 2) {
        return response({
          ok: false,
          status: 401,
          json: async () => ({ success: false, error: { message: "Invalid or expired session" } }),
        })
      }
      return response({ json: async () => ({ success: true, data: { ok: true } }) })
    })
    vi.stubGlobal("fetch", fetchMock)

    await Promise.all([
      apiClient("/subjects", { auth: "required" }),
      apiClient("/questions", { auth: "required" }),
    ])

    expect(csrfAttempts).toBe(1)
    expect(refreshAttempts).toBe(1)
    expect(protectedAttempts).toBe(4)
  })

  it("reacquires CSRF once for its exact 403 and preserves unrelated 403 errors", async () => {
    setCsrfToken("stale-csrf")
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          ok: false,
          status: 403,
          json: async () => ({ error: { message: "CSRF token missing or invalid" } }),
        })
      )
      .mockResolvedValueOnce(
        response({ json: async () => ({ success: true, data: { csrfToken: "fresh-csrf" } }) })
      )
      .mockResolvedValueOnce(response({ json: async () => ({ success: true, data: { saved: true } }) }))
      .mockResolvedValueOnce(
        response({
          ok: false,
          status: 403,
          json: async () => ({ error: { message: "Request origin is not allowed" } }),
        })
      )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiClient("/practice/42/answers", { method: "PATCH", auth: "required" })
    ).resolves.toEqual({ saved: true })
    await expect(
      apiClient("/practice/42/answers", { method: "PATCH", auth: "required" })
    ).rejects.toMatchObject({ status: 403, message: "Request origin is not allowed" })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it("invalidates the session when exact-CSRF recovery terminates with 401", async () => {
    setCsrfToken("stale-csrf")
    const onInvalid = vi.fn()
    const unsubscribe = subscribeToSessionInvalid(onInvalid)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          ok: false,
          status: 403,
          json: async () => ({ error: { message: "CSRF token missing or invalid" } }),
        })
      )
      .mockResolvedValueOnce(
        response({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Invalid or expired session" } }),
        })
      )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiClient("/practice/42/answers", { method: "PATCH", auth: "required" })
    ).rejects.toMatchObject({ status: 401 })
    expect(onInvalid).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it("rejects an authenticated response that completes after session clearing", async () => {
    let resolveResponse: ((value: Response) => void) | undefined
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve
          })
      )
    )

    const request = apiClient("/subjects", { auth: "required" })
    clearSessionCredentials()
    resolveResponse?.(
      response({ json: async () => ({ success: true, data: { subjects: [] } }) })
    )

    await expect(request).rejects.toBeInstanceOf(ApiAbortError)
  })

  it("waits for an active refresh before beginning session termination", async () => {
    let resolveRefresh: ((value: Response) => void) | undefined
    let protectedAttempts = 0
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/auth/csrf")) {
        return response({ json: async () => ({ success: true, data: { csrfToken: "csrf" } }) })
      }
      if (url.endsWith("/auth/refresh")) {
        return new Promise<Response>((resolve) => {
          resolveRefresh = resolve
        })
      }
      protectedAttempts += 1
      return response({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid or expired session" } }),
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    const protectedRequest = apiClient("/subjects", { auth: "required" })
    await vi.waitFor(() => expect(resolveRefresh).toBeTypeOf("function"))
    const operation = vi.fn(async () => "terminated")
    const termination = runWithSessionTermination(operation)
    const duplicateOperation = vi.fn(async () => "duplicate")
    const duplicateTermination = runWithSessionTermination(duplicateOperation)

    expect(operation).not.toHaveBeenCalled()
    resolveRefresh?.(
      response({ json: async () => ({ success: true, data: { csrfToken: "rotated" } }) })
    )

    await expect(protectedRequest).rejects.toBeInstanceOf(ApiAbortError)
    await expect(termination).resolves.toBe("terminated")
    await expect(duplicateTermination).resolves.toBe("terminated")
    expect(operation).toHaveBeenCalledOnce()
    expect(duplicateOperation).not.toHaveBeenCalled()
    expect(protectedAttempts).toBe(1)
  })

  it("falls back to anonymous optional auth when no cookie session exists", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Authentication session missing or invalid" } }),
        })
      )
      .mockResolvedValueOnce(
        response({ status: 201, json: async () => ({ success: true, data: { message: "Sent" } }) })
      )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiClient("/contact", { method: "POST", body: {}, auth: "optional" })
    ).resolves.toEqual({ message: "Sent" })

    const contactHeaders = fetchMock.mock.calls[1][1].headers as Record<string, string>
    expect(contactHeaders["X-CSRF-Token"]).toBeUndefined()
  })
})
