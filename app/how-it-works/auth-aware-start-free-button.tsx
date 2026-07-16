"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface AuthAwareStartFreeButtonProps {
  className?: string
}

export function AuthAwareStartFreeButton({ className }: AuthAwareStartFreeButtonProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const target = isAuthenticated ? "/subjects" : `/login?next=${encodeURIComponent("/subjects")}`

  if (isLoading) {
    return (
      <Button className={className} disabled>
        Start free
      </Button>
    )
  }

  return (
    <Button className={className} asChild>
      <Link href={target}>Start free</Link>
    </Button>
  )
}
