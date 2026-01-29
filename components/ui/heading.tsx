import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface HeadingProps {
  children: ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
}

export function Heading({ children, className, as: Component = "h2", size = "lg" }: HeadingProps) {
  const sizeStyles = {
    xs: "text-lg font-semibold",
    sm: "text-xl font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold md:text-4xl",
    xl: "text-4xl font-bold md:text-5xl",
    "2xl": "text-5xl font-bold md:text-6xl",
  }

  return (
    <Component className={cn("text-foreground tracking-tight text-balance", sizeStyles[size], className)}>
      {children}
    </Component>
  )
}
