import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  variant?: "default" | "compact" | "spacious"
  background?: "default" | "muted" | "primary"
}

export function Section({ children, className, variant = "default", background = "default" }: SectionProps) {
  const variantStyles = {
    default: "py-16 md:py-24",
    compact: "py-12 md:py-16",
    spacious: "py-20 md:py-32",
  }

  const backgroundStyles = {
    default: "",
    muted: "bg-muted/50",
    primary: "bg-primary/5",
  }

  return <section className={cn(variantStyles[variant], backgroundStyles[background], className)}>{children}</section>
}
