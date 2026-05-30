"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyEmail } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"

type VerifyStatus = "idle" | "loading" | "success" | "error" | "empty"

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const hasAttempted = useRef(false)
  const [status, setStatus] = useState<VerifyStatus>("idle")
  const [message, setMessage] = useState("")

  const verifyToken = useCallback(async (emailToken: string) => {
    setStatus("loading")
    setMessage("")
    try {
      const response = await verifyEmail({ token: emailToken })
      setStatus("success")
      setMessage(response.message)
    } catch (error) {
      setStatus("error")
      setMessage(formatApiError(error))
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus("empty")
      setMessage("Verification token is missing.")
      return
    }
    if (hasAttempted.current) {
      return
    }
    hasAttempted.current = true
    void verifyToken(token)
  }, [token, verifyToken])

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-md border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Verify your email</CardTitle>
            <CardDescription>Complete account verification to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="status">
                Verifying your email...
              </div>
            )}

            {status === "success" && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status">
                {message}
              </div>
            )}

            {status === "error" && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {message || "Verification failed. Please try again."}
              </div>
            )}

            {status === "empty" && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="status">
                {message}
              </div>
            )}

            {status === "error" && token && (
              <Button className="w-full rounded-lg" onClick={() => void verifyToken(token)}>
                Try again
              </Button>
            )}

            {status === "success" && (
              <Button asChild className="w-full rounded-lg">
                <Link href="/login">Go to login</Link>
              </Button>
            )}

            {(status === "empty" || status === "error") && (
              <Button asChild variant="outline" className="w-full rounded-lg bg-transparent">
                <Link href="/resend-verification">Resend verification email</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
