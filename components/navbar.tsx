"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "@/components/icons"
import { BrandLogo } from "@/components/brand-logo"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if this link is active
  // - Home (/) is only active on exact match
  // - Other routes are active if pathname starts with href
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
      )}
    >
      {children}
      {/* Active indicator underline */}
      {isActive && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />}
    </Link>
  )
}

export function Navbar() {
  const { isAuthenticated, logout, isLoading } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-20 items-center justify-between px-2 sm:h-24 sm:px-3">
        {/* Logo */}
        <Link href="/" className="-ml-1 flex items-center rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:-ml-3" aria-label="Shikkha Buddy home">
          <BrandLogo className="h-16 sm:h-20" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <NavLink href="/subjects">Practice</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        {/* Auth Buttons - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={logout} className="min-h-11 gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="min-h-11" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" className="min-h-11 rounded-lg shadow-primary" asChild>
                    <Link href="/signup">Start free</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <MobileMenu />
      </div>
    </nav>
  )
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, logout, isLoading } = useAuth()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const menuId = "mobile-navigation"

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-11"
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </Button>

      {isOpen && (
        <div id={menuId} className="absolute left-0 right-0 top-full border-b border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-1">
            <Link
              href="/subjects"
              aria-current={isActive("/subjects") ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive("/subjects") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              Practice
            </Link>
            <Link
              href="/how-it-works"
              aria-current={isActive("/how-it-works") ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive("/how-it-works") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              aria-current={isActive("/pricing") ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive("/pricing") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              Pricing
            </Link>
            {!isLoading && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" className="min-h-11 justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="min-h-11 justify-start" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button size="sm" className="min-h-11 rounded-lg" asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>Start free</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
