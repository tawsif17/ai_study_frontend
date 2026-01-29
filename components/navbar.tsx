"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap, LogOut } from "@/components/icons"
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
      className={cn(
        "text-sm font-medium transition-colors relative py-1",
        isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
      )}
    >
      {children}
      {/* Active indicator underline */}
      {isActive && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
    </Link>
  )
}

export function Navbar() {
  const { isAuthenticated, logout, isLoading } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Shikkha Buddy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/subjects">Subjects</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        {/* Auth Buttons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Sign Up</Link>
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

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              Home
            </Link>
            <Link
              href="/subjects"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/subjects") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              Subjects
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/how-it-works") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/pricing") ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary",
              )}
            >
              Pricing
            </Link>
            {!isLoading && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
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
