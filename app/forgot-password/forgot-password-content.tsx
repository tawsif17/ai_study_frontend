"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, MailCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import { getRemainingCooldownSeconds } from "@/lib/resend-cooldown-storage"
import { getPasswordResetCooldownStorageKey, readPasswordResetCooldownExpiry, startPasswordResetCooldown } from "@/lib/password-recovery"
import { isValidVerificationEmail, normalizeVerificationEmail } from "@/lib/verification-form-recovery"

type SubmitStatus = "idle" | "loading" | "success" | "error"

export function ForgotPasswordContent() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const normalizedEmail = normalizeVerificationEmail(email)

  useEffect(() => {
    const expiresAt = readPasswordResetCooldownExpiry(normalizedEmail)
    setCooldownExpiresAt(expiresAt)
    setCooldownSeconds(getRemainingCooldownSeconds(expiresAt))
  }, [normalizedEmail])

  useEffect(() => {
    if (!cooldownExpiresAt) return
    const interval = window.setInterval(() => {
      const seconds = getRemainingCooldownSeconds(cooldownExpiresAt)
      setCooldownSeconds(seconds)
      if (seconds === 0) setCooldownExpiresAt(0)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [cooldownExpiresAt])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== getPasswordResetCooldownStorageKey(normalizedEmail)) return
      const expiresAt = readPasswordResetCooldownExpiry(normalizedEmail)
      setCooldownExpiresAt(expiresAt)
      setCooldownSeconds(getRemainingCooldownSeconds(expiresAt))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [normalizedEmail])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
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
      const response = await forgotPassword({ email: normalizedEmail })
      setStatus("success")
      setMessage(response.message)
      const expiresAt = startPasswordResetCooldown(normalizedEmail)
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
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Reset your password</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send a password reset link if the account is eligible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {status === "error" && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert"><AlertCircle className="mr-2 inline size-4" aria-hidden="true" />{message}</div>}
              {status === "success" && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status" aria-live="polite"><MailCheck className="mr-2 inline size-4" aria-hidden="true" />{message}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(null); if (status === "error") { setStatus("idle"); setMessage("") } }} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "forgot-password-email-error" : undefined} required disabled={status === "loading"} />
                {emailError && <p id="forgot-password-email-error" className="text-sm text-destructive">{emailError}</p>}
              </div>
              <Button type="submit" className="w-full rounded-lg" disabled={status === "loading" || cooldownSeconds > 0 || !email.trim()}>{status === "loading" ? "Sending..." : cooldownSeconds > 0 ? `Send again in ${cooldownSeconds}s` : "Send password reset link"}</Button>
              {cooldownSeconds > 0 && <p className="text-center text-xs text-muted-foreground" role="status" aria-live="polite">To protect your inbox, you can request another reset link in {cooldownSeconds} seconds.</p>}
              <Button asChild variant="outline" className="w-full rounded-lg bg-transparent" disabled={status === "loading"}><Link href="/login">Back to login</Link></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
