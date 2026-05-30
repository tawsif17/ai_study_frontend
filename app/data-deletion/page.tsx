import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Lawyer/founder review required before launch. Do not promise automated deletion until backend support exists.
export const metadata: Metadata = {
  title: "Data Deletion | Shikkha Buddy",
  description: "How users can request account or data deletion for Shikkha Buddy.",
  openGraph: {
    title: "Data Deletion | Shikkha Buddy",
    description: "How users can request account or data deletion for Shikkha Buddy.",
  },
  twitter: {
    card: "summary",
    title: "Data Deletion | Shikkha Buddy",
    description: "How users can request account or data deletion for Shikkha Buddy.",
  },
}

const sections = [
  {
    title: "How to request deletion",
    body: "Users can request account or data deletion through the Contact or Support path. Include the account email address and a clear request so the team can identify the account.",
  },
  {
    title: "What may be included",
    items: [
      "Account profile information such as name, email, school, city, and class.",
      "Practice activity, answers, saved progress, or session history where applicable.",
      "Support messages connected to the account or request.",
    ],
  },
  {
    title: "Processing requests",
    body: "Deletion requests should be reviewed and processed according to applicable requirements and operational needs. Some information may need to be retained where required for security, dispute handling, or legal reasons.",
  },
  {
    title: "No automatic deletion promise",
    body: "This page does not promise an automatic self-service deletion flow. The current support path is the Contact or Support page.",
  },
]

export default function DataDeletionPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="Data Deletion"
      description="How users can request account or data deletion through the current support path."
      sections={sections}
    />
  )
}
