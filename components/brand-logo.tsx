import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: "navbar" | "footer" | "auth"
  className?: string
  priority?: boolean
}

const wrapperByVariant: Record<NonNullable<BrandLogoProps["variant"]>, string> = {
  navbar: "h-10 md:h-11",
  footer: "h-16 md:h-[4.5rem]",
  auth: "h-14 md:h-[3.75rem]",
}

export function BrandLogo({ variant = "navbar", className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/shikkha-buddy-logo.svg"
      alt="Shikkha Buddy"
      width={994}
      height={372}
      priority={priority}
      className={cn("block w-auto select-none", wrapperByVariant[variant], className)}
    />
  )
}
