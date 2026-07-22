import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { VerifyEmailContent } from "./verify-email-content"

export const metadata: Metadata = {
  title: "Verify Email | Shikkha Buddy",
  description: "Complete email verification for your Shikkha Buddy account.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Email | Shikkha Buddy",
    description: "Complete email verification for your Shikkha Buddy account.",
  },
  twitter: {
    card: "summary",
    title: "Verify Email | Shikkha Buddy",
    description: "Complete email verification for your Shikkha Buddy account.",
  },
}

function VerifyEmailFallback() {
  return (
    <PageShell>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </PageShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
