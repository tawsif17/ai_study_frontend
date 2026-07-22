"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useSWRConfig } from "swr"
import { ApiClientError, clearAuthToken, formatApiError, setAuthToken } from "./api/client"
import {
  getAuthMe,
  login as apiLogin,
  register as apiRegister,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
  type RegisterResult,
} from "./api"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "retryable-refresh-error"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  authStatus?: AuthStatus
  authError?: string | null
  user: AuthUser | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegisterResult>
  logout: () => void
  refreshUser: () => Promise<AuthUser | null>
  retryAuth?: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading")
  const [authError, setAuthError] = useState<string | null>(null)

  const clearSession = useCallback(() => {
    clearAuthToken()
    setUser(null)
    setIsAuthenticated(false)
    setAuthStatus("unauthenticated")
    setAuthError(null)
  }, [])

  const setRetryableRefreshError = useCallback((error: unknown) => {
    // A token still exists locally. Preserve it until the API confirms that it is invalid.
    setIsAuthenticated(true)
    setAuthStatus("retryable-refresh-error")
    setAuthError(formatApiError(error))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await getAuthMe()
      setUser(response.user)
      setIsAuthenticated(true)
      setAuthStatus("authenticated")
      setAuthError(null)
      return response.user
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearSession()
      } else {
        setRetryableRefreshError(error)
      }
      return null
    }
  }, [clearSession, setRetryableRefreshError])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (typeof window === "undefined") {
        return
      }

      const token = localStorage.getItem("auth_token")
      if (!token) {
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
          setAuthStatus("unauthenticated")
          setAuthError(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await getAuthMe()
        if (mounted) {
          setUser(response.user)
          setIsAuthenticated(true)
          setAuthStatus("authenticated")
          setAuthError(null)
        }
      } catch (error) {
        if (mounted) {
          if (error instanceof ApiClientError && error.status === 401) {
            clearAuthToken()
            setUser(null)
            setIsAuthenticated(false)
            setAuthStatus("unauthenticated")
            setAuthError(null)
          } else {
            // The browser still has a token; do not convert an outage into a logout.
            setIsAuthenticated(true)
            setAuthStatus("retryable-refresh-error")
            setAuthError(formatApiError(error))
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data)
    setAuthToken(response.token)
    setUser(response.user)
    setIsAuthenticated(true)
    setAuthStatus("authenticated")
    setAuthError(null)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    return apiRegister(data)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    mutate(
      (key) =>
        key === "revision-summary" ||
        (Array.isArray(key) &&
          [
            "subjects",
            "questions",
            "practice-summary",
            "practice-items",
            "practice-answers",
            "practice-results",
            "progress-dashboard",
            "revision-items",
          ].includes(key[0])),
      undefined,
      { revalidate: false }
    )
  }, [clearSession, mutate])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authStatus,
        authError,
        user,
        login,
        register,
        logout,
        refreshUser,
        retryAuth: refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
