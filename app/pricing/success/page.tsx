import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { UpgradeSuccessContent } from "./upgrade-success-content"

export const metadata: Metadata = {
  title: "Upgrade Successful | Shikkha Buddy",
  description: "Your Shikkha Buddy plan upgrade has been confirmed.",
  openGraph: {
    title: "Upgrade Successful | Shikkha Buddy",
    description: "Your Shikkha Buddy plan upgrade has been confirmed.",
  },
  twitter: {
    card: "summary",
    title: "Upgrade Successful | Shikkha Buddy",
    description: "Your Shikkha Buddy plan upgrade has been confirmed.",
  },
}

function PricingSuccessFallback() {
  return (
    <PageShell>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </PageShell>
  )
}

export default function PricingSuccessPage() {
  return (
    <Suspense fallback={<PricingSuccessFallback />}>
      <UpgradeSuccessContent />
    </Suspense>
  )
}
