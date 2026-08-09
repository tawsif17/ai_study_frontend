import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Founder review required before launch. Keep claims factual and avoid invented company/team details.
export const metadata: Metadata = {
  title: "About | Shikkha Buddy",
  alternates: { canonical: "/about" },
  description: "Learn what Shikkha Buddy is, who it is for, and the current SSC science practice focus.",
  openGraph: {
    title: "About | Shikkha Buddy",
    description: "Learn what Shikkha Buddy is, who it is for, and the current SSC science practice focus.",
  },
  twitter: {
    card: "summary",
    title: "About | Shikkha Buddy",
    description: "Learn what Shikkha Buddy is, who it is for, and the current SSC science practice focus.",
  },
}

export const aboutSections = [
  {
    title: "What Shikkha Buddy is",
    body: "Shikkha Buddy is a Bangladesh-focused SSC MCQ practice platform for Mathematics, Physics, and Chemistry. Students choose a subject and chapters, answer AI-generated questions shaped by exam-style patterns, and review correct answers after submitting. Beta Pro adds explanations, Bookmarks and Mistakes revision, Weak Area Analysis, and Board-only MCQ sets.",
  },
  {
    title: "Who it is for",
    items: [
      "SSC students who want structured practice for science subjects.",
      "Parents who want a clearer practice path for a student at home.",
      "Teachers or mentors who want to understand what the student-facing practice flow currently supports.",
    ],
  },
  {
    title: "Current focus",
    body: "The current frontend is focused on SSC science practice. The public product surface currently highlights Mathematics, Physics, and Chemistry.",
  },
  {
    title: "Still improving",
    body: "The platform is still being improved. Some features may change as the product, backend, question coverage, and support processes mature.",
  },
]

export default function AboutPage() {
  return (
    <TrustPage
      eyebrow="Company"
      title="About Shikkha Buddy"
      description="A simple overview of the product, current focus, and who it is built for."
      sections={aboutSections}
    />
  )
}
