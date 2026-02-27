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

export default function VerifyEmailPage() {
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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>Complete account verification to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                Verifying your email...
              </div>
            )}

            {status === "success" && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {status === "error" && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {message || "Verification failed. Please try again."}
              </div>
            )}

            {status === "empty" && (
              <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                {message}
              </div>
            )}

            {status === "error" && token && (
              <Button className="w-full" onClick={() => void verifyToken(token)} disabled={status === "loading"}>
                Try again
              </Button>
            )}

            {status === "success" && (
              <Button asChild className="w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            )}

            {(status === "empty" || status === "error") && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/resend-verification">Resend verification email</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
