"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyEmail } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageShell><div className="min-h-[calc(100vh-8rem)]" /></PageShell>}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams])

  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!token) {
        if (active) {
          setMessage("Verification token is missing.")
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await verifyEmail({ token })
        if (!active) {
          return
        }
        setMessage(response.message)
        setIsSuccess(true)
        setIsLoading(false)
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } catch (error) {
        if (!active) {
          return
        }
        setMessage(formatApiError(error))
        setIsSuccess(false)
        setIsLoading(false)
      }
    }

    run()

    return () => {
      active = false
    }
  }, [router, token])

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {isLoading ? "Verifying your email..." : isSuccess ? "Email verified" : "Unable to verify email"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={
                  isSuccess
                    ? "p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success"
                    : "p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                }
              >
                {message}
              </div>
            )}

            {isLoading && (
              <p className="text-sm text-muted-foreground text-center">Please wait while we confirm your token.</p>
            )}

            {!isLoading && (
              <Button asChild className="w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
