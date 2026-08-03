import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { ResetPasswordContent } from "./reset-password-content"

export const metadata: Metadata = {
  title: "Choose a New Password | Shikkha Buddy",
  description: "Choose a new password for your Shikkha Buddy account.",
  robots: { index: false, follow: false },
}

function ResetPasswordFallback() {
  return <PageShell><div className="min-h-[calc(100vh-8rem)]" /></PageShell>
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<ResetPasswordFallback />}><ResetPasswordContent /></Suspense>
}
