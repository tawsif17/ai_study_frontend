import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { LoginContent } from "./login-content"

export const metadata: Metadata = {
  title: "Login | Shikkha Buddy",
  description: "Sign in to continue your Shikkha Buddy SSC science practice.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Login | Shikkha Buddy",
    description: "Sign in to continue your Shikkha Buddy SSC science practice.",
  },
  twitter: {
    card: "summary",
    title: "Login | Shikkha Buddy",
    description: "Sign in to continue your Shikkha Buddy SSC science practice.",
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageShell><div className="min-h-[calc(100vh-8rem)]" /></PageShell>}>
      <LoginContent />
    </Suspense>
  )
}
