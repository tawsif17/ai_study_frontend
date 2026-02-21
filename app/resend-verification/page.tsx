"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resendVerification } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"

type SubmitStatus = "idle" | "loading" | "success" | "error"

export default function ResendVerificationPage() {
  const searchParams = useSearchParams()
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams])
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    try {
      const response = await resendVerification({ email: email.trim() })
      setStatus("success")
      setMessage(response.message)
    } catch (error) {
      setStatus("error")
      setMessage(formatApiError(error))
    }
  }

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Resend verification email</CardTitle>
            <CardDescription>Enter your email to receive a new verification link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {message}
                </div>
              )}
              {status === "success" && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === "loading" || !email.trim()}>
                {status === "loading" ? "Sending..." : "Send verification email"}
              </Button>

              <Button asChild variant="outline" className="w-full" disabled={status === "loading"}>
                <Link href="/login">Back to login</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
