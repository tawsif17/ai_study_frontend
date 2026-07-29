"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface AuthGatedLinkProps {
  href: string
  className?: string
  children: React.ReactNode
  authenticatedChildren?: React.ReactNode
  unauthenticatedHref?: string
}

export function AuthGatedLink({
  href,
  className,
  children,
  authenticatedChildren,
  unauthenticatedHref,
}: AuthGatedLinkProps) {
  const { authStatus, isAuthenticated } = useAuth()
  const target = isAuthenticated
    ? href
    : authStatus === "unauthenticated"
      ? unauthenticatedHref ?? `/login?next=${encodeURIComponent(href)}`
      : href

  return (
    <Link href={target} className={className}>
      {isAuthenticated ? authenticatedChildren ?? children : children}
    </Link>
  )
}
