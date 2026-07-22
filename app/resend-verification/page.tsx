import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { ResendVerificationContent } from "./resend-verification-content"

export const metadata: Metadata = {
  title: "Resend Verification Email | Shikkha Buddy",
  description: "Request a new verification email for your Shikkha Buddy account.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Resend Verification Email | Shikkha Buddy",
    description: "Request a new verification email for your Shikkha Buddy account.",
  },
  twitter: {
    card: "summary",
    title: "Resend Verification Email | Shikkha Buddy",
    description: "Request a new verification email for your Shikkha Buddy account.",
  },
}

function ResendVerificationFallback() {
  return (
    <PageShell>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </PageShell>
  )
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<ResendVerificationFallback />}>
      <ResendVerificationContent />
    </Suspense>
  )
}
