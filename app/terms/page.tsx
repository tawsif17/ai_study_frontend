import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Lawyer/founder review required before launch. Do not treat this as final legal terms.
export const metadata: Metadata = {
  title: "Terms and Conditions | Shikkha Buddy",
  description: "Plain-language terms overview for using Shikkha Buddy's SSC science practice platform.",
  openGraph: {
    title: "Terms and Conditions | Shikkha Buddy",
    description: "Plain-language terms overview for using Shikkha Buddy's SSC science practice platform.",
  },
  twitter: {
    card: "summary",
    title: "Terms and Conditions | Shikkha Buddy",
    description: "Plain-language terms overview for using Shikkha Buddy's SSC science practice platform.",
  },
}

const sections = [
  {
    title: "Educational use",
    body: "Shikkha Buddy is intended to support SSC science practice. It is not a replacement for teachers, schools, textbooks, or official exam guidance.",
  },
  {
    title: "Account responsibility",
    body: "Users should provide accurate signup information, keep login details private, and use the account in a responsible way. Parents or guardians should guide younger students when appropriate.",
  },
  {
    title: "AI content limitations",
    body: "Some questions, feedback, or explanations may be generated or assisted by AI. AI content may contain mistakes, so students should verify important answers with teachers, textbooks, or trusted learning materials.",
  },
  {
    title: "Acceptable use",
    items: [
      "Do not misuse the platform or attempt to disrupt service.",
      "Do not share harmful, abusive, or misleading content through support or contact forms.",
      "Do not attempt to access another user's account or data.",
    ],
  },
  {
    title: "Paid access and subscriptions",
    body: "The current frontend may show Free and Pro access information. Because the payment flow may not be final, paid-plan details, billing, cancellation, and refund terms should be confirmed when checkout or formal payment terms are available.",
  },
]

export default function TermsPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="Terms and Conditions"
      description="A plain-language overview of responsible use, education limits, and account expectations."
      sections={sections}
    />
  )
}
