import type { Metadata } from "next"
import { FAQContent } from "./faq-content"

export const metadata: Metadata = {
  title: "FAQ | Shikkha Buddy",
  description:
    "Clear answers about Shikkha Buddy beta access, available subjects, practice modes, AI-generated content, and support.",
  openGraph: {
    title: "FAQ | Shikkha Buddy",
    description:
      "Clear answers about Shikkha Buddy beta access, available subjects, practice modes, AI-generated content, and support.",
  },
  twitter: {
    card: "summary",
    title: "FAQ | Shikkha Buddy",
    description:
      "Clear answers about Shikkha Buddy beta access, available subjects, practice modes, AI-generated content, and support.",
  },
}

export default function FAQPage() {
  return <FAQContent />
}
