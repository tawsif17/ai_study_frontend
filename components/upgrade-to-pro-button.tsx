"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { upgradeToPro } from "@/lib/api"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"

const DEFAULT_NEXT_PATH = "/subjects"

function normalizeNextPath(value: string | null): string {
  if (typeof value === "string" && value.startsWith("/")) {
    return value
  }
  return DEFAULT_NEXT_PATH
}

export function UpgradeToProButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextPath = useMemo(() => normalizeNextPath(searchParams.get("next")), [searchParams])
  const loginRedirect = `/login?next=${encodeURIComponent(`/pricing?next=${encodeURIComponent(nextPath)}`)}`

  const handleUpgrade = async () => {
    setError(null)

    if (!isAuthenticated) {
      router.push(loginRedirect)
      return
    }

    if (user?.plan_tier === "pro") {
      router.push(nextPath)
      return
    }

    setIsSubmitting(true)
    try {
      await upgradeToPro()
      await refreshUser()
      router.push(`/pricing/success?next=${encodeURIComponent(nextPath)}`)
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        router.push(loginRedirect)
      } else {
        setError(formatApiError(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const label = isLoading
    ? "Loading..."
    : user?.plan_tier === "pro"
      ? "Continue with Pro"
      : isSubmitting
        ? "Upgrading..."
        : "Upgrade to Pro"

  return (
    <>
      <Button className="w-full" onClick={handleUpgrade} disabled={isLoading || isSubmitting}>
        {label}
      </Button>
      <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">
        One click upgrade. No payment step in this release.
      </p>
      {error && <p className="text-[10px] md:text-xs text-destructive text-center mt-2">{error}</p>}
    </>
  )
}
