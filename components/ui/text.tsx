import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface TextProps {
  children: ReactNode
  className?: string
  variant?: "default" | "muted" | "small" | "large" | "lead"
}

export function Text({ children, className, variant = "default" }: TextProps) {
  const variantStyles = {
    default: "text-base text-foreground",
    muted: "text-base text-muted-foreground",
    small: "text-sm text-muted-foreground",
    large: "text-lg text-foreground",
    lead: "text-xl text-muted-foreground",
  }

  return <p className={cn("leading-relaxed", variantStyles[variant], className)}>{children}</p>
}
