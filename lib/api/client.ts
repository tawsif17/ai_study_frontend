/**
 * Shared HTTP client for backend API.
 */

import type { ApiError } from "./types"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api").replace(
  /\/+$/,
  ""
)

export const DEFAULT_API_TIMEOUT_MS = 15_000
const SAFE_GENERIC_ERROR = "Something went wrong. Please try again."
const SAFE_CONNECTION_ERROR = "We could not reach Shikkha Buddy. Check your connection and try again."

export class ApiClientError extends Error {
  code?: string
  status: number

  constructor(error: ApiError, status: number) {
    super(error.message)
    this.code = error.code
    this.status = status
    this.name = "ApiClientError"
  }
}

export class ApiTimeoutError extends Error {
  timeoutMs: number

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = "ApiTimeoutError"
    this.timeoutMs = timeoutMs
  }
}

export class ApiNetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super("The API could not be reached", options)
    this.name = "ApiNetworkError"
  }
}

export class ApiAbortError extends Error {
  constructor(options?: ErrorOptions) {
    super("The request was cancelled", options)
    this.name = "ApiAbortError"
  }
}

export class ApiContractError extends Error {
  constructor(message = "The server returned an unexpected response", options?: ErrorOptions) {
    super(message, options)
    this.name = "ApiContractError"
  }
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.status >= 500 ? SAFE_GENERIC_ERROR : error.message || SAFE_GENERIC_ERROR
  }
  if (error instanceof ApiTimeoutError || error instanceof ApiNetworkError) {
    return SAFE_CONNECTION_ERROR
  }
  if (error instanceof ApiAbortError) {
    return "The request was cancelled. Please try again."
  }
  if (error instanceof ApiContractError) {
    return SAFE_GENERIC_ERROR
  }
  return SAFE_GENERIC_ERROR
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  params?: Record<string, string | number | undefined>
  auth?: "none" | "optional" | "required"
  timeoutMs?: number
  signal?: AbortSignal
}

export interface ApiClientResponse<T> {
  data: T
  status: number
}

const CSRF_ERROR_MESSAGE = "CSRF token missing or invalid"
const UNSAFE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"])

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null
let refreshRequest: Promise<string> | null = null
const sessionInvalidListeners = new Set<() => void>()

export function setCsrfToken(token: string): void {
  csrfToken = token
}

export function clearSessionCredentials(): void {
  csrfToken = null
  csrfRequest = null
  refreshRequest = null
}

export function removeLegacyAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export function subscribeToSessionInvalid(listener: () => void): () => void {
  sessionInvalidListeners.add(listener)
  return () => sessionInvalidListeners.delete(listener)
}

export function notifySessionInvalid(): void {
  clearSessionCredentials()
  for (const listener of sessionInvalidListeners) listener()
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await apiClientWithResponse<T>(endpoint, options)
  return response.data
}

export async function apiClientWithResponse<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiClientResponse<T>> {
  const method = options.method ?? "GET"
  const auth = options.auth ?? "none"
  const unsafe = UNSAFE_METHODS.has(method)
  let requestCsrfToken: string | undefined

  if (unsafe && auth !== "none") {
    try {
      requestCsrfToken = await ensureCsrfToken()
    } catch (error) {
      if (!(auth === "optional" && error instanceof ApiClientError && error.status === 401)) {
        if (auth === "required" && error instanceof ApiClientError && error.status === 401) {
          notifySessionInvalid()
        }
        throw error
      }
    }
  }

  try {
    return await executeRequest<T>(endpoint, options, requestCsrfToken)
  } catch (error) {
    if (auth === "required" && error instanceof ApiClientError && error.status === 401) {
      try {
        requestCsrfToken = await refreshSession()
        return await executeRequest<T>(endpoint, options, unsafe ? requestCsrfToken : undefined)
      } catch (refreshError) {
        if (refreshError instanceof ApiClientError && refreshError.status === 401) {
          notifySessionInvalid()
        }
        throw refreshError
      }
    }

    if (
      unsafe &&
      auth !== "none" &&
      error instanceof ApiClientError &&
      error.status === 403 &&
      error.message === CSRF_ERROR_MESSAGE
    ) {
      csrfToken = null
      requestCsrfToken = await ensureCsrfToken()
      return executeRequest<T>(endpoint, options, requestCsrfToken)
    }

    throw error
  }
}

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken
  if (csrfRequest) return csrfRequest

  csrfRequest = executeRequest<{ csrfToken: string }>("/auth/csrf", {
    auth: "none",
  })
    .then((response) => {
      csrfToken = parseCsrfTokenData(response.data, "CSRF token")
      return csrfToken
    })
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}

async function refreshSession(): Promise<string> {
  if (refreshRequest) return refreshRequest

  refreshRequest = (async () => {
    let token = await ensureCsrfToken()
    let response: ApiClientResponse<{ csrfToken: string }>

    try {
      response = await executeRequest("/auth/refresh", {
        method: "POST",
        auth: "none",
      }, token)
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.status === 403 &&
        error.message === CSRF_ERROR_MESSAGE
      ) {
        csrfToken = null
        token = await ensureCsrfToken()
        response = await executeRequest("/auth/refresh", {
          method: "POST",
          auth: "none",
        }, token)
      } else {
        throw error
      }
    }

    csrfToken = parseCsrfTokenData(response.data, "session refresh")
    return csrfToken
  })().finally(() => {
    refreshRequest = null
  })

  return refreshRequest
}

function parseCsrfTokenData(input: unknown, contractName: string): string {
  if (
    !input ||
    typeof input !== "object" ||
    Object.keys(input).length !== 1 ||
    !("csrfToken" in input) ||
    typeof input.csrfToken !== "string" ||
    input.csrfToken.length === 0
  ) {
    throw new ApiContractError(`The server returned an invalid ${contractName}`)
  }
  return input.csrfToken
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestOptions,
  requestCsrfToken?: string
): Promise<ApiClientResponse<T>> {
  const {
    method = "GET",
    body,
    params,
    timeoutMs = DEFAULT_API_TIMEOUT_MS,
    signal: callerSignal,
  } = options

  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value))
    })
    const queryString = searchParams.toString()
    if (queryString) url += `?${queryString}`
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (requestCsrfToken) headers["X-CSRF-Token"] = requestCsrfToken

  const controller = new AbortController()
  let timedOut = false
  const onCallerAbort = () => controller.abort(callerSignal?.reason)
  if (callerSignal?.aborted) controller.abort(callerSignal.reason)
  else callerSignal?.addEventListener("abort", onCallerAbort, { once: true })

  const effectiveTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs >= 0
    ? timeoutMs
    : DEFAULT_API_TIMEOUT_MS
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, effectiveTimeoutMs)

  const cleanup = () => {
    clearTimeout(timeoutId)
    callerSignal?.removeEventListener("abort", onCallerAbort)
  }

  const transportError = (error: unknown): Error => {
    if (timedOut) return new ApiTimeoutError(effectiveTimeoutMs)
    if (callerSignal?.aborted || controller.signal.aborted) {
      return new ApiAbortError({ cause: error })
    }
    return new ApiNetworkError({ cause: error })
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: method === "GET" ? "no-store" : "default",
      credentials: "include",
      signal: controller.signal,
    })
  } catch (error) {
    cleanup()
    throw transportError(error)
  }

  try {
    if (!response.ok) {
      let error: ApiError
      try {
        const payload = await response.json()
        const message =
          (typeof payload?.message === "string" && payload.message) ||
          (typeof payload?.error?.message === "string" && payload.error.message) ||
          (typeof payload?.data?.message === "string" && payload.data.message) ||
          (typeof payload?.msg === "string" && payload.msg)
        error = {
          code: typeof payload?.code === "string" ? payload.code : undefined,
          message: message || `Request failed with status ${response.status}`,
        }
      } catch (parseError) {
        if (timedOut || callerSignal?.aborted || controller.signal.aborted) {
          throw transportError(parseError)
        }
        error = { code: undefined, message: `Request failed with status ${response.status}` }
      }
      throw new ApiClientError(error, response.status)
    }

    let json: unknown
    try {
      json = await response.json()
    } catch (error) {
      if (timedOut || callerSignal?.aborted || controller.signal.aborted) {
        throw transportError(error)
      }
      throw new ApiContractError("The server returned invalid JSON", { cause: error })
    }

    if (json && typeof json === "object" && "success" in json && "data" in json) {
      return { data: (json as { data: T }).data, status: response.status }
    }
    return { data: json as T, status: response.status }
  } finally {
    cleanup()
  }
}
