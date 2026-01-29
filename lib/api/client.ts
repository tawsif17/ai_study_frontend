/**
 * Shared HTTP client for backend API
 */

import type { ApiError } from "./types"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api").replace(
  /\/+$/,
  ""
)

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

export function formatApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    const message = error.message || "Something went wrong."
    if (error.code) {
      return `${error.code}: ${message}`
    }
    return `${error.status}: ${message}`
  }
  if (error instanceof Error && error.message) {
    return `UNKNOWN_ERROR: ${error.message}`
  }
  return "UNKNOWN_ERROR: An unexpected error occurred."
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  params?: Record<string, string | number | undefined>
  requiresAuth?: boolean
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, requiresAuth = false } = options

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (requiresAuth) {
    const token = getAuthToken()
    if (!token) {
      throw new ApiClientError(
        { code: "UNAUTHORIZED", message: "Authentication required" },
        401
      )
    }
    headers["Authorization"] = `Bearer ${token}`
  }

  // Make request
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // Avoid 304s with empty bodies; SWR handles client-side caching.
    cache: method === "GET" ? "no-store" : "default",
  })

  // Handle non-2xx responses
  if (!response.ok) {
    let error: ApiError
    try {
      error = await response.json()
    } catch {
      error = {
        code: "UNKNOWN_ERROR",
        message: `Request failed with status ${response.status}`,
      }
    }
    throw new ApiClientError(error, response.status)
  }

  // Parse response
  const json = await response.json()
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return (json as { data: T }).data
  }
  return json
}
