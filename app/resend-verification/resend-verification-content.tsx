"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resendVerification } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import {
  getRemainingCooldownSeconds,
  getResendCooldownStorageKey,
  readResendCooldownExpiry,
  startResendCooldown,
} from "@/lib/resend-cooldown-storage"
import {
  isValidVerificationEmail,
  normalizeVerificationEmail,
} from "@/lib/verification-form-recovery"

type SubmitStatus = "idle" | "loading" | "success" | "error"

export function ResendVerificationContent() {
  const searchParams = useSearchParams()
  const initialEmail = useMemo(() => normalizeVerificationEmail(searchParams.get("email") ?? ""), [searchParams])
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [message, setMessage] = useState("")
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [emailError, setEmailError] = useState<string | null>(null)
  const normalizedEmail = normalizeVerificationEmail(email)

  useEffect(() => {
    const expiresAt = readResendCooldownExpiry(normalizedEmail)
    setCooldownExpiresAt(expiresAt)
    setCooldownSeconds(getRemainingCooldownSeconds(expiresAt))
  }, [normalizedEmail])

  useEffect(() => {
    if (cooldownExpiresAt === 0) return

    const interval = window.setInterval(() => {
      const seconds = getRemainingCooldownSeconds(cooldownExpiresAt)
      setCooldownSeconds(seconds)
      if (seconds === 0) setCooldownExpiresAt(0)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [cooldownExpiresAt])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== getResendCooldownStorageKey(normalizedEmail)) return
      const expiresAt = readResendCooldownExpiry(normalizedEmail)
      setCooldownExpiresAt(expiresAt)
      setCooldownSeconds(getRemainingCooldownSeconds(expiresAt))
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [normalizedEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldownSeconds > 0) return
    if (!isValidVerificationEmail(normalizedEmail)) {
      setEmailError("Enter a valid email address.")
      return
    }
    setEmail(normalizedEmail)
    setEmailError(null)
    setStatus("loading")
    setMessage("")
    try {
      const response = await resendVerification({ email: normalizedEmail })
      setStatus("success")
      setMessage(response.message)
      const expiresAt = startResendCooldown(normalizedEmail)
      setCooldownExpiresAt(expiresAt)
      setCooldownSeconds(getRemainingCooldownSeconds(expiresAt))
    } catch (error) {
      setStatus("error")
      setMessage(formatApiError(error))
    }
  }

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-md border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Resend verification email</CardTitle>
            <CardDescription>Enter your email to receive a new verification link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {status === "error" && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {message}
                </div>
              )}
              {status === "success" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(null)
                    if (status === "error") {
                      setStatus("idle")
                      setMessage("")
                    }
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "resend-email-error" : undefined}
                  required
                  disabled={status === "loading"}
                />
                {emailError && <p id="resend-email-error" className="text-sm text-destructive">{emailError}</p>}
              </div>

              <Button type="submit" className="w-full rounded-lg" disabled={status === "loading" || cooldownSeconds > 0 || !email.trim()}>
                {status === "loading"
                  ? "Sending..."
                  : cooldownSeconds > 0
                    ? `Resend available in ${cooldownSeconds}s`
                    : "Send verification email"}
              </Button>

              {cooldownSeconds > 0 && (
                <p className="text-center text-xs text-muted-foreground" role="status" aria-live="polite">
                  To protect your inbox, you can request another email in {cooldownSeconds} seconds.
                </p>
              )}

              <Button asChild variant="outline" className="w-full rounded-lg bg-transparent" disabled={status === "loading"}>
                <Link href="/login">Back to login</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
