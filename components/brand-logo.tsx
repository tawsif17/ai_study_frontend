import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  priority?: boolean
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/shikkha-buddy-logo.svg"
      alt="Shikkha Buddy"
      width={877}
      height={136}
      priority={priority}
      unoptimized
      className={cn("h-9 w-auto shrink-0", className)}
    />
  )
}
