import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface BadgeStatusProps {
  children: ReactNode
  variant?: "default" | "success" | "warning" | "info" | "destructive"
  className?: string
}

export function BadgeStatus({ children, variant = "default", className }: BadgeStatusProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
