import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Lawyer/founder review required before launch. Do not add certification or compliance claims unless verified.
export const metadata: Metadata = {
  title: "Data Protection | Shikkha Buddy",
  description: "How Shikkha Buddy describes careful handling of student account and practice information.",
  openGraph: {
    title: "Data Protection | Shikkha Buddy",
    description: "How Shikkha Buddy describes careful handling of student account and practice information.",
  },
  twitter: {
    card: "summary",
    title: "Data Protection | Shikkha Buddy",
    description: "How Shikkha Buddy describes careful handling of student account and practice information.",
  },
}

const sections = [
  {
    title: "Careful data handling",
    body: "Shikkha Buddy should handle student account and practice data carefully because the product is built for education. The product should avoid collecting information that is not needed for account, practice, or support use.",
  },
  {
    title: "Access limitation",
    body: "Access to account and support information should be limited to people and systems that need it to operate, support, secure, or improve the product.",
  },
  {
    title: "Account security",
    items: [
      "Users should keep passwords private and avoid sharing accounts.",
      "Users should contact support if they believe an account has been accessed by someone else.",
      "The product should continue improving security practices as the platform matures.",
    ],
  },
  {
    title: "No unsupported certification claims",
    body: "This page does not claim a specific compliance certification or audit status. Any formal compliance statement should be added only after proper review and evidence.",
  },
]

export default function DataProtectionPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="Data Protection"
      description="A plain-language overview of how student account and practice information should be handled."
      sections={sections}
    />
  )
}
