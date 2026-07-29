"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface AuthAwareStartFreeButtonProps {
  className?: string
}

export function AuthAwareStartFreeButton({ className }: AuthAwareStartFreeButtonProps) {
  const { authStatus, isAuthenticated, isLoading } = useAuth()
  const target = isAuthenticated ? "/subjects" : `/login?next=${encodeURIComponent("/subjects")}`
  const isSessionIndeterminate = authStatus === "retryable-refresh-error"

  if (isLoading || isSessionIndeterminate) {
    return (
      <Button className={className} disabled>
        Start free
      </Button>
    )
  }

  return (
    <Button className={className} asChild>
      <Link href={target}>{isAuthenticated ? "Practice" : "Start free"}</Link>
    </Button>
  )
}
