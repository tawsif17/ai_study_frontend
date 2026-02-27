"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { clearAuthToken, setAuthToken } from "./api/client"
import {
  getAuthMe,
  login as apiLogin,
  register as apiRegister,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
  type RegisterResponse,
} from "./api"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegisterResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      const response = await getAuthMe()
      setUser(response.user)
      setIsAuthenticated(true)
    } catch {
      clearAuthToken()
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

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
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await getAuthMe()
        if (mounted) {
          setUser(response.user)
          setIsAuthenticated(true)
        }
      } catch {
        clearAuthToken()
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
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
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    return apiRegister(data)
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
        refreshUser,
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
