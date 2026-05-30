import type { Metadata } from "next"
import { PricingContent } from "./pricing-content"

export const metadata: Metadata = {
  title: "Pricing | Shikkha Buddy",
  description: "Compare Shikkha Buddy free and pro options for focused SSC science practice.",
  openGraph: {
    title: "Pricing | Shikkha Buddy",
    description: "Compare Shikkha Buddy free and pro options for focused SSC science practice.",
  },
  twitter: {
    card: "summary",
    title: "Pricing | Shikkha Buddy",
    description: "Compare Shikkha Buddy free and pro options for focused SSC science practice.",
  },
}

export default function PricingPage() {
  return <PricingContent />
}
