import type { Metadata } from "next"
import { PricingContent } from "./pricing-content"

export const metadata: Metadata = {
  title: "Pricing | Shikkha Buddy",
  alternates: { canonical: "/pricing" },
  description: "Compare Free and Beta Pro access for focused SSC practice.",
  openGraph: {
    title: "Pricing | Shikkha Buddy",
    description: "Compare Free and Beta Pro access for focused SSC practice.",
  },
  twitter: {
    card: "summary",
    title: "Pricing | Shikkha Buddy",
    description: "Compare Free and Beta Pro access for focused SSC practice.",
  },
}

export default function PricingPage() {
  return <PricingContent />
}
