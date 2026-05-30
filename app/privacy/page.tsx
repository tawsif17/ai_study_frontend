import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Lawyer/founder review required before launch. This content is intentionally plain-language and non-final.
export const metadata: Metadata = {
  title: "Privacy Policy | Shikkha Buddy",
  description: "Plain-language privacy information for Shikkha Buddy student accounts, practice data, and support requests.",
  openGraph: {
    title: "Privacy Policy | Shikkha Buddy",
    description: "Plain-language privacy information for Shikkha Buddy student accounts, practice data, and support requests.",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Shikkha Buddy",
    description: "Plain-language privacy information for Shikkha Buddy student accounts, practice data, and support requests.",
  },
}

const sections = [
  {
    title: "Information collected",
    body: "Shikkha Buddy may collect account and learning information needed to provide the product experience.",
    items: [
      "Name and email address for account creation and login.",
      "School, city, and class information when provided during signup.",
      "Practice activity, selected subjects, answers, saved progress, and session results where the product uses those features.",
      "Messages sent through the Contact or Support flow.",
    ],
  },
  {
    title: "Why information is used",
    items: [
      "To create and manage student accounts.",
      "To provide access to SSC science subjects and practice sessions.",
      "To save progress and help users continue their study flow.",
      "To respond to support requests and investigate reported content issues.",
      "To improve product quality and reliability.",
    ],
  },
  {
    title: "Student data",
    body: "Student information should be handled carefully. The product should collect only information that supports the account, practice, and support experience. Parents or guardians should review account use for younger students.",
  },
  {
    title: "Deletion requests",
    body: "Users can request account or data deletion through the Contact or Support path. Requests should be reviewed and processed according to the product's operational and applicable requirements.",
  },
]

export default function PrivacyPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="Privacy Policy"
      description="A plain-language overview of what information Shikkha Buddy may collect and why it is used."
      sections={sections}
    />
  )
}
