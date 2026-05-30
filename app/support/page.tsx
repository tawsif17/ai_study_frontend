import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Founder review required before launch. Do not add support SLAs or email addresses until approved.
export const metadata: Metadata = {
  title: "Support | Shikkha Buddy",
  description: "Find the current support path for Shikkha Buddy account, practice, and content questions.",
  openGraph: {
    title: "Support | Shikkha Buddy",
    description: "Find the current support path for Shikkha Buddy account, practice, and content questions.",
  },
  twitter: {
    card: "summary",
    title: "Support | Shikkha Buddy",
    description: "Find the current support path for Shikkha Buddy account, practice, and content questions.",
  },
}

const sections = [
  {
    title: "How to get help",
    body: "Use the Contact page to send a support request. This is the current support path for account questions, practice issues, content concerns, and general feedback.",
  },
  {
    title: "Common support topics",
    items: [
      "Account signup, login, or email verification issues.",
      "Questions not loading or practice sessions not starting.",
      "A possible mistake in a question, option, answer, or explanation.",
      "Questions about Free and Pro access in the current beta release.",
      "Requests related to account or data deletion.",
    ],
  },
  {
    title: "What to include",
    body: "When reporting an issue, include the page you were using, the subject or practice mode involved, and a short description of what happened. Do not include passwords or sensitive personal details in the message.",
  },
]

export default function SupportPage() {
  return (
    <TrustPage
      eyebrow="Support"
      title="Support"
      description="The current support path for students, parents, and early users."
      sections={sections}
    />
  )
}
