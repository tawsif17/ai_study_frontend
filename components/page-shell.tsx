import React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

interface PageShellProps {
  children: React.ReactNode
  className?: string
  /** Whether to show the navbar */
  showNavbar?: boolean
  /** Whether to show the footer */
  showFooter?: boolean
  /** Additional classes for the main content area */
  mainClassName?: string
}

/**
 * Consistent page shell wrapper for all marketing pages.
 * Provides Navbar at top, Footer at bottom, and flex layout for content.
 */
export function PageShell({
  children,
  className,
  showNavbar = true,
  showFooter = true,
  mainClassName,
}: PageShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-background px-4 py-3 font-semibold text-foreground shadow-lg ring-2 ring-ring transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      {showNavbar && <Navbar />}
      <main id="main-content" tabIndex={-1} className={cn("flex-1", mainClassName)}>{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
