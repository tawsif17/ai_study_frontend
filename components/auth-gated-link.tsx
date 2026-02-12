"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface AuthGatedLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function AuthGatedLink({ href, className, children }: AuthGatedLinkProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const target = !isLoading && isAuthenticated ? href : `/login?next=${encodeURIComponent(href)}`

  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  )
}
