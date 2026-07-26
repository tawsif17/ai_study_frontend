import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { ForgotPasswordContent } from "./forgot-password-content"

export const metadata: Metadata = {
  title: "Reset Password | Shikkha Buddy",
  description: "Request a password reset link for your Shikkha Buddy account.",
  robots: { index: false, follow: false },
}

function ForgotPasswordFallback() {
  return <PageShell><div className="min-h-[calc(100vh-8rem)]" /></PageShell>
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<ForgotPasswordFallback />}><ForgotPasswordContent /></Suspense>
}
