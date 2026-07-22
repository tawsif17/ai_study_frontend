"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { AuthStatus } from "@/lib/auth-context"

interface SessionRecoveryBannerProps {
  authStatus: AuthStatus
  authError: string | null
  onRetry: () => Promise<unknown>
}

export function SessionRecoveryBanner({
  authStatus,
  authError,
  onRetry,
}: SessionRecoveryBannerProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (authStatus !== "retryable-refresh-error") return null

  const retry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="sticky top-0 z-[60] px-3 py-2" aria-live="polite">
      <Alert variant="destructive" className="mx-auto max-w-5xl bg-background shadow-md">
        <AlertTitle>We could not refresh your account</AlertTitle>
        <AlertDescription>
          <p>Your session is still saved. Check your connection and try again.</p>
          {authError ? <p>{authError}</p> : null}
          <Button type="button" size="sm" variant="outline" onClick={retry} disabled={isRetrying}>
            {isRetrying ? "Retrying…" : "Retry"}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
