import type { Metadata } from "next"
import { Bot, CircleCheck, GraduationCap, ShieldCheck } from "lucide-react"
import { PolicyPage, type PolicySection, type PolicySummaryItem } from "@/components/policy-page"

export const metadata: Metadata = {
  title: "Terms of Use | Shikkha Buddy",
  description: "Terms for using Shikkha Buddy's SSC practice platform during beta.",
  openGraph: {
    title: "Terms of Use | Shikkha Buddy",
    description: "Terms for using Shikkha Buddy's SSC practice platform during beta.",
  },
  twitter: {
    card: "summary",
    title: "Terms of Use | Shikkha Buddy",
    description: "Terms for using Shikkha Buddy's SSC practice platform during beta.",
  },
}

const summary: PolicySummaryItem[] = [
  {
    title: "Educational use only",
    description: "Use Shikkha Buddy to support your SSC revision and practice.",
    icon: GraduationCap,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Beta features may change",
    description: "The platform may improve, change, or pause features during beta.",
    icon: CircleCheck,
    iconClassName: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "AI can make mistakes",
    description: "Check important answers against textbooks, teachers, or official materials.",
    icon: Bot,
    iconClassName: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Use responsibly",
    description: "Respect accounts, content, and the safety of the platform.",
    icon: ShieldCheck,
    iconClassName: "bg-violet-500/10 text-violet-700",
  },
]

const sections: PolicySection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    paragraphs: [
      "By using Shikkha Buddy, you agree to these Terms of Use. If you do not agree, please do not use the platform.",
    ],
  },
  {
    id: "about",
    title: "About Shikkha Buddy",
    paragraphs: [
      "Shikkha Buddy is an SSC practice platform for students in Bangladesh. The current beta focuses on General Math, Physics, and Chemistry, with practice, explanations, revision guidance, and related learning tools.",
    ],
  },
  {
    id: "beta-access",
    title: "Beta access and Beta Pro",
    paragraphs: [
      "Shikkha Buddy is currently in beta. No payment is required for beta access, and no paid subscription, automatic renewal, or checkout is created through the platform during beta.",
      "Beta Pro is optional access for verified beta users. It includes Board-only MCQ sets and Weak Area Analysis for more focused revision.",
    ],
  },
  {
    id: "accounts",
    title: "Student accounts",
    items: [
      "Provide accurate account information and keep your login details private.",
      "Use your own account and do not try to access another user's account or data.",
      "Parents or guardians should support younger students with account setup, platform use, and support requests when appropriate.",
    ],
  },
  {
    id: "educational-use",
    title: "Educational use and content accuracy",
    paragraphs: [
      "Shikkha Buddy supports learning and revision. It does not replace teachers, schools, textbooks, coaching centres, official materials, or a student's own study.",
      "Questions, explanations, feedback, recommendations, and AI-assisted content may contain mistakes, missing context, or incomplete information. Verify important answers with trusted educational materials.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    items: [
      "Do not cheat, scrape, copy, sell, share, or redistribute platform content without permission.",
      "Do not disrupt the service, reverse engineer it, bypass security, submit harmful material, or misuse the platform.",
      "Do not use support, feedback, or reporting channels to send abusive, unlawful, or unsafe content.",
    ],
  },
  {
    id: "availability",
    title: "Availability and changes",
    paragraphs: [
      "Subjects, chapters, question types, explanations, practice modes, and revision features may change as the beta develops. We may update, pause, or remove features when needed to operate and improve the platform.",
      "Shikkha Buddy does not guarantee uninterrupted service, complete content coverage, perfect AI output, a particular score, admission result, ranking, scholarship, or academic outcome.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy and contact",
    paragraphs: [
      "Your use of Shikkha Buddy is also governed by the Privacy Policy and Cookie Policy. For account, support, deletion, or policy questions, use the Contact page.",
    ],
  },
]

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Use"
      updatedAt="July 16, 2026"
      description="The rules for using Shikkha Buddy for SSC exam practice, account access, learning content, and beta features."
      summary={summary}
      sections={sections}
      ctaTitle="Questions about these terms?"
      ctaDescription="For account access, support, deletion, or policy questions, contact Shikkha Buddy through the Contact page."
      secondaryLink={{ href: "/privacy", label: "Privacy Policy" }}
    />
  )
}
