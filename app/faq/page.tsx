import type { Metadata } from "next"
import { TrustPage } from "@/components/trust-page"

// Founder review required before launch. Keep answers conservative until business/legal text is final.
export const metadata: Metadata = {
  title: "FAQ | Shikkha Buddy",
  description: "Answers to common questions about Shikkha Buddy, SSC science practice, AI content, data use, and support.",
  openGraph: {
    title: "FAQ | Shikkha Buddy",
    description: "Answers to common questions about Shikkha Buddy, SSC science practice, AI content, data use, and support.",
  },
  twitter: {
    card: "summary",
    title: "FAQ | Shikkha Buddy",
    description: "Answers to common questions about Shikkha Buddy, SSC science practice, AI content, data use, and support.",
  },
}

const sections = [
  {
    title: "What is Shikkha Buddy?",
    body: "Shikkha Buddy is a practice platform for Bangladesh SSC science students. It helps students choose subjects, practice questions, and review explanations.",
  },
  {
    title: "Who is it for?",
    body: "It is mainly for SSC students preparing for science subjects. Parents, teachers, and mentors may also use the public pages to understand the current practice flow.",
  },
  {
    title: "Which subjects are available?",
    body: "The current product focus is Higher Math, Physics, and Chemistry for SSC science practice.",
  },
  {
    title: "Is it free?",
    body: "The frontend currently presents a Free plan with limited practice and a Pro access option. Availability and limits may change as the product is developed.",
  },
  {
    title: "What does Pro mean right now?",
    body: "Pro currently represents broader practice access in the beta flow. The current frontend does not show an online payment checkout step, and final paid-plan terms should be confirmed when the payment flow is ready.",
  },
  {
    title: "Does AI always give correct answers?",
    body: "No. AI-generated questions, feedback, and explanations may contain mistakes. Students should verify important answers with teachers, textbooks, or trusted learning materials.",
  },
  {
    title: "How is student data used?",
    body: "Account and practice information is used to provide the learning experience, such as signup, subject access, practice sessions, saved progress, and support. More details are available on the Privacy and Data Protection pages.",
  },
  {
    title: "How can users contact support?",
    body: "Use the Contact page for account, practice, content, or support requests.",
  },
  {
    title: "How can users request account or data deletion?",
    body: "Use the Contact page or Support page to request account or data deletion. The process depends on the product's operational and legal requirements.",
  },
]

export default function FAQPage() {
  return (
    <TrustPage
      eyebrow="Help"
      title="Frequently Asked Questions"
      description="Short answers to common product, practice, AI, data, and support questions."
      sections={sections}
    />
  )
}
