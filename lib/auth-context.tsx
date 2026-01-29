"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { setAuthToken, clearAuthToken, isAuthenticated as checkAuth } from "./api/client"
import { login as apiLogin, register as apiRegister, type LoginRequest, type RegisterRequest } from "./api"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<{ id: number; email: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check auth status on mount
    setIsAuthenticated(checkAuth())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data)
    setAuthToken(response.token)
    setIsAuthenticated(true)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await apiRegister(data)
    return response
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
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
