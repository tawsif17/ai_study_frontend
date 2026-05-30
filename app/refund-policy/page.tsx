import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Lawyer/founder review required before launch. Avoid firm refund promises until business terms are final.
export const metadata: Metadata = {
  title: "Refund Policy | Shikkha Buddy",
  description: "Current refund and cancellation information for Shikkha Buddy while paid access terms are still being finalized.",
  openGraph: {
    title: "Refund Policy | Shikkha Buddy",
    description: "Current refund and cancellation information for Shikkha Buddy while paid access terms are still being finalized.",
  },
  twitter: {
    card: "summary",
    title: "Refund Policy | Shikkha Buddy",
    description: "Current refund and cancellation information for Shikkha Buddy while paid access terms are still being finalized.",
  },
}

const sections = [
  {
    title: "Current payment status",
    body: "The current frontend may describe Free and Pro access, but the online payment checkout flow may not be final. Any paid-plan terms should be confirmed at checkout when payments are available.",
  },
  {
    title: "Refund requests",
    body: "If a payment-related issue occurs after paid access is launched, users should contact support with the account details and a short description of the issue. Refund handling should follow the final paid-plan terms shown at the time of purchase.",
  },
  {
    title: "Cancellations",
    body: "Cancellation steps should be confirmed when the final subscription or payment flow is available. Until then, users can contact support for account and access questions.",
  },
  {
    title: "Questions before payment",
    body: "Students and parents should review the plan details carefully before purchasing when payment becomes available.",
  },
]

export default function RefundPolicyPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="Refund Policy"
      description="Current high-level guidance for refund and cancellation questions while paid access terms are being finalized."
      sections={sections}
    />
  )
}
