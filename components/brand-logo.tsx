import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  priority?: boolean
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/shikkha-buddy-max.svg"
      alt="Shikkha Buddy"
      width={4096}
      height={4096}
      priority={priority}
      unoptimized
      className={cn("h-10 w-auto", className)}
    />
  )
}
