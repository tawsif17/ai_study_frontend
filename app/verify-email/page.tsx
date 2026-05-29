import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { VerifyEmailContent } from "./verify-email-content"

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
