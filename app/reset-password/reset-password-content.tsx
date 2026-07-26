"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/api"
import { getPasswordValidationError, mapPasswordResetRecovery, type PasswordResetRecovery } from "@/lib/password-recovery"

type ResetStatus = "idle" | "loading" | "success" | "error" | "empty"
type FieldErrors = Partial<Record<"password" | "confirmPassword", string>>

export function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const [token] = useState(() => searchParams.get("token"))
  const [status, setStatus] = useState<ResetStatus>("idle")
  const [message, setMessage] = useState("")
  const [recovery, setRecovery] = useState<PasswordResetRecovery | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const tokenCleaned = useRef(false)

  useEffect(() => {
    if (tokenCleaned.current) return
    tokenCleaned.current = true
    const url = new URL(window.location.href)
    url.searchParams.delete("token")
    const query = url.searchParams.toString()
    window.history.replaceState(window.history.state, "", `${url.pathname}${query ? `?${query}` : ""}${url.hash}`)
    if (!token) {
      setStatus("empty")
      setMessage("Password reset token is missing.")
    }
  }, [token])

  const submitReset = useCallback(async () => {
    if (!token) return
    const nextFieldErrors: FieldErrors = {}
    const passwordError = getPasswordValidationError(password)
    if (passwordError) nextFieldErrors.password = passwordError
    if (password !== confirmPassword) nextFieldErrors.confirmPassword = "Passwords do not match."
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return
    setStatus("loading")
    setMessage("")
    setRecovery(null)
    try {
      const response = await resetPassword({ token, newPassword: password })
      setStatus("success")
      setMessage(response.message)
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      const nextRecovery = mapPasswordResetRecovery(error)
      setStatus("error")
      setRecovery(nextRecovery)
      setMessage(nextRecovery.message)
    }
  }, [confirmPassword, password, token])

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-md border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center"><CardTitle className="text-2xl" role="heading" aria-level={1}>Choose a new password</CardTitle><CardDescription>Use at least 8 characters, including uppercase, lowercase, and a number.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {status === "empty" && <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="status">{message}</div>}
            {status === "error" && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert"><p className="font-medium"><AlertCircle className="mr-1 inline size-4" aria-hidden="true" />{recovery?.title ?? "Password reset failed"}</p><p className="mt-1">{message}</p></div>}
            {status === "success" && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status" aria-live="polite"><CheckCircle2 className="mr-1 inline size-4" aria-hidden="true" />{message}</div>}
            {status !== "success" && status !== "empty" && <form onSubmit={(event) => { event.preventDefault(); void submitReset() }} className="space-y-4" noValidate>
              <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" name="new-password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })) }} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "reset-password-requirements reset-password-error" : "reset-password-requirements"} required disabled={status === "loading"} /> <p id="reset-password-requirements" className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, and a number.</p>{fieldErrors.password && <p id="reset-password-error" className="text-sm text-destructive">{fieldErrors.password}</p>}</div>
              <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" name="confirm-password" autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((current) => ({ ...current, confirmPassword: undefined })) }} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? "reset-password-confirm-error" : undefined} required disabled={status === "loading"} />{fieldErrors.confirmPassword && <p id="reset-password-confirm-error" className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>}</div>
              <Button type="submit" className="w-full rounded-lg" disabled={status === "loading"}>{status === "loading" ? "Resetting password..." : "Reset password"}</Button>
            </form>}
            {status === "error" && recovery?.retryable && <Button className="w-full rounded-lg" onClick={() => void submitReset()}>Try again</Button>}
            {(status === "empty" || (status === "error" && recovery?.nextAction === "forgot")) && <Button asChild className="w-full rounded-lg"><Link href="/forgot-password">Request a new reset link</Link></Button>}
            {status === "success" && <Button asChild className="w-full rounded-lg"><Link href="/login">Go to login</Link></Button>}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
