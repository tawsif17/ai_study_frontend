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
  const { authStatus } = useAuth()
  const target =
    authStatus === "unauthenticated" ? `/login?next=${encodeURIComponent(href)}` : href

  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  )
}
