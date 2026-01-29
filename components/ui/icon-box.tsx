import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface IconBoxProps {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "accent" | "muted"
}

export function IconBox({ children, className, size = "md", variant = "default" }: IconBoxProps) {
  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const variantStyles = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    muted: "bg-muted text-muted-foreground",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
