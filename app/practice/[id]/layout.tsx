import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Practice Session | Shikkha Buddy",
  robots: { index: false, follow: false },
}

export default function PracticeSessionLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}
