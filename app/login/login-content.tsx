"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "@/components/icons"
import { useAuth } from "@/lib/auth-context"
import { formatApiError } from "@/lib/api/client"
import { isUnverifiedLoginError } from "@/lib/api"

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(
    searchParams.get("registered") === "true"
      ? "Registration successful. Please check your email and verify your account before logging in."
      : null
  )
  const [showResend, setShowResend] = useState(false)
  const [formData, setFormData] = useState({
    email: searchParams.get("email") ?? "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setShowResend(false)
    setIsLoading(true)

    try {
      await login({
        email: formData.email,
        password: formData.password,
      })
      router.push("/subjects")
    } catch (err) {
      setError(formatApiError(err))
      setShowResend(isUnverifiedLoginError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-md border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Welcome back</CardTitle>
            <CardDescription>Sign in to continue your SSC science practice</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success" role="status">
                  {success}
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {showResend && (
                <Button asChild variant="outline" className="w-full rounded-lg bg-transparent">
                  <Link href={`/resend-verification?email=${encodeURIComponent(formData.email)}`}>
                    Resend verification email
                  </Link>
                </Button>
              )}

              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
