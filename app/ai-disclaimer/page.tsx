import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Founder/lawyer review required before launch. Keep AI limits visible and conservative.
export const metadata: Metadata = {
  title: "AI Disclaimer | Shikkha Buddy",
  description: "Important limitations for AI-generated questions, explanations, and feedback in Shikkha Buddy.",
  openGraph: {
    title: "AI Disclaimer | Shikkha Buddy",
    description: "Important limitations for AI-generated questions, explanations, and feedback in Shikkha Buddy.",
  },
  twitter: {
    card: "summary",
    title: "AI Disclaimer | Shikkha Buddy",
    description: "Important limitations for AI-generated questions, explanations, and feedback in Shikkha Buddy.",
  },
}

const sections = [
  {
    title: "AI may make mistakes",
    body: "Questions, explanations, feedback, or study guidance generated or assisted by AI may contain mistakes, missing context, or unclear wording.",
  },
  {
    title: "Verify important answers",
    body: "Students should verify important answers with teachers, textbooks, class notes, or other trusted learning materials, especially before exams.",
  },
  {
    title: "Learning support, not a teacher replacement",
    body: "Shikkha Buddy is designed to support practice and revision. It does not replace teachers, schools, tutoring, textbooks, or official curriculum guidance.",
  },
  {
    title: "Report content issues",
    body: "If a question, answer, option, or explanation appears wrong, users can report it through the Contact or Support path so the issue can be reviewed.",
  },
]

export default function AIDisclaimerPage() {
  return (
    <TrustPage
      eyebrow="Trust and legal"
      title="AI Disclaimer"
      description="Important limits for AI-generated educational content in Shikkha Buddy."
      sections={sections}
    />
  )
}
