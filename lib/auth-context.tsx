"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSWRConfig } from "swr"
import { SessionRecoveryBanner } from "@/components/session-recovery-banner"
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

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  authStatus: AuthStatus
  authError: string | null
  user: AuthUser | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegisterResult>
  logout: () => void
  refreshUser: () => Promise<AuthUser | null>
  retryAuth: () => Promise<AuthUser | null>
}

type AuthSyncMessage = { type: "login" | "logout"; sentAt: number }

const AUTH_CHANNEL_NAME = "shikkha-buddy-auth"
const AUTH_SYNC_STORAGE_KEY = "shikkha_buddy_auth_sync"

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const sessionVersionRef = useRef(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading")
  const [authError, setAuthError] = useState<string | null>(null)

  const clearAuthCache = useCallback(() => {
    void mutate(
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
  }, [mutate])

  const publishAuthChange = useCallback((type: AuthSyncMessage["type"]) => {
    const message: AuthSyncMessage = { type, sentAt: Date.now() }
    if (channelRef.current) {
      channelRef.current.postMessage(message)
      return
    }
    try {
      localStorage.setItem(AUTH_SYNC_STORAGE_KEY, JSON.stringify(message))
    } catch {
      // Storage can be unavailable in private browser contexts. The current tab
      // remains correct even when other tabs cannot be notified.
    }
  }, [])

  const clearSession = useCallback(
    ({ broadcast = true }: { broadcast?: boolean } = {}) => {
      sessionVersionRef.current += 1
      clearAuthToken()
      setUser(null)
      setIsAuthenticated(false)
      setAuthStatus("unauthenticated")
      setAuthError(null)
      clearAuthCache()
      if (broadcast) publishAuthChange("logout")
    },
    [clearAuthCache, publishAuthChange]
  )

  const setRetryableRefreshError = useCallback((error: unknown) => {
    // The token remains locally stored until the API explicitly rejects it.
    setIsAuthenticated(true)
    setAuthStatus("retryable-refresh-error")
    setAuthError(formatApiError(error))
  }, [])

  const refreshUser = useCallback(async () => {
    const requestVersion = sessionVersionRef.current + 1
    sessionVersionRef.current = requestVersion
    try {
      const response = await getAuthMe()
      if (sessionVersionRef.current !== requestVersion) return null
      setUser(response.user)
      setIsAuthenticated(true)
      setAuthStatus("authenticated")
      setAuthError(null)
      return response.user
    } catch (error) {
      if (sessionVersionRef.current !== requestVersion) return null
      if (error instanceof ApiClientError && error.status === 401) clearSession()
      else setRetryableRefreshError(error)
      return null
    }
  }, [clearSession, setRetryableRefreshError])

  useEffect(() => {
    let active = true

    const initializeAuth = async () => {
      const requestVersion = sessionVersionRef.current + 1
      sessionVersionRef.current = requestVersion
      const token = localStorage.getItem("auth_token")
      if (!token) {
        if (active) {
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
        if (active && sessionVersionRef.current === requestVersion) {
          setUser(response.user)
          setIsAuthenticated(true)
          setAuthStatus("authenticated")
          setAuthError(null)
        }
      } catch (error) {
        if (active && sessionVersionRef.current === requestVersion) {
          if (error instanceof ApiClientError && error.status === 401) clearSession()
          else setRetryableRefreshError(error)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void initializeAuth()
    return () => {
      active = false
    }
  }, [clearSession, setRetryableRefreshError])

  useEffect(() => {
    const receiveAuthChange = (message: AuthSyncMessage) => {
      if (message.type === "logout") clearSession({ broadcast: false })
      else void refreshUser()
    }

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME)
      channelRef.current = channel
      channel.addEventListener("message", (event: MessageEvent<AuthSyncMessage>) => {
        if (event.data?.type === "login" || event.data?.type === "logout") {
          receiveAuthChange(event.data)
        }
      })
      return () => {
        channelRef.current = null
        channel.close()
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_STORAGE_KEY || !event.newValue) return
      try {
        const message = JSON.parse(event.newValue) as AuthSyncMessage
        if (message.type === "login" || message.type === "logout") receiveAuthChange(message)
      } catch {
        // Ignore malformed values written by unrelated scripts or browser extensions.
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [clearSession, refreshUser])

  const login = useCallback(
    async (data: LoginRequest) => {
      const requestVersion = sessionVersionRef.current
      const response = await apiLogin(data)
      if (sessionVersionRef.current !== requestVersion) return
      sessionVersionRef.current += 1
      setAuthToken(response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      setAuthStatus("authenticated")
      setAuthError(null)
      publishAuthChange("login")
    },
    [publishAuthChange]
  )

  const register = useCallback((data: RegisterRequest) => apiRegister(data), [])
  const logout = useCallback(() => clearSession(), [clearSession])

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
      <SessionRecoveryBanner
        authStatus={authStatus}
        authError={authError}
        onRetry={refreshUser}
      />
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
