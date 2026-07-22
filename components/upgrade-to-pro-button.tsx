"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { upgradeToPro } from "@/lib/api"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { getSafeNextPath } from "@/lib/safe-next-path"

export function UpgradeToProButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUnavailable, setIsUnavailable] = useState(false)

  const nextPath = useMemo(() => getSafeNextPath(searchParams.get("next")), [searchParams])
  const loginRedirect = `/login?next=${encodeURIComponent(`/pricing?next=${encodeURIComponent(nextPath)}`)}`
  const isAlreadyActive = user?.plan_tier === "pro"
  const isVerified = Boolean(user?.email_verified_at)
  const isUnverified = isAuthenticated && !isLoading && !isAlreadyActive && !isVerified
  const resendVerificationHref = user?.email ? `/resend-verification?email=${encodeURIComponent(user.email)}` : "/resend-verification"

  const handleUpgrade = async () => {
    setError(null)
    setIsUnavailable(false)

    if (!isAuthenticated) {
      router.push(loginRedirect)
      return
    }

    if (isAlreadyActive) {
      router.push(nextPath)
      return
    }

    setIsSubmitting(true)
    try {
      const activation = await upgradeToPro()
      if (activation.plan_tier !== "pro") {
        setError("We could not confirm Beta Pro for this account. Please try again.")
        return
      }

      const refreshedUser = await refreshUser()
      if (!refreshedUser) {
        setError("We could not refresh your account. Please try again.")
        return
      }

      if (refreshedUser.plan_tier !== "pro") {
        setError("We could not confirm Beta Pro for this account. Please try again.")
        return
      }

      sessionStorage.setItem("beta-pro-activation-confirmed", nextPath)
      router.push(`/pricing/success?next=${encodeURIComponent(nextPath)}`)
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        router.push(loginRedirect)
      } else if (err instanceof ApiClientError && (err.status === 404 || err.status >= 500)) {
        setIsUnavailable(true)
      } else {
        setError(formatApiError(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const label = isLoading
    ? "Loading beta access..."
    : isAlreadyActive
      ? "Continue with Beta Pro"
      : isUnverified
        ? "Verify your email"
        : isSubmitting
          ? "Activating Beta Pro..."
          : "Activate Beta Pro"

  const helperText = isLoading
    ? "Checking your beta access."
    : isAlreadyActive
      ? "Beta Pro is already active for this account."
      : isUnverified
        ? "Verify your email before activating Beta Pro."
        : "No trial, subscription, renewal or automatic billing."

  return (
    <div>
      {isUnverified ? (
        <Button asChild aria-describedby="beta-pro-helper" className="min-h-11 w-full">
          <Link href={resendVerificationHref}>Verify your email</Link>
        </Button>
      ) : (
        <Button
          aria-describedby="beta-pro-helper"
          className="min-h-11 w-full"
          onClick={handleUpgrade}
          disabled={isLoading || isSubmitting || isUnavailable}
        >
          {label}
        </Button>
      )}
      <p id="beta-pro-helper" className="mt-2 text-center text-xs leading-5 text-muted-foreground" role="status">
        {helperText}
      </p>
      {isUnavailable && (
        <p className="mt-2 text-center text-xs text-destructive" role="alert">
          Beta Pro activation is unavailable right now. Please try again later.
        </p>
      )}
      {error && <p className="mt-2 text-center text-xs text-destructive" role="alert">{error}</p>}
    </div>
  )
}
