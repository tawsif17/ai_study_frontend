import type { Metadata } from "next"
import { Ban, Cookie, FileText, SlidersHorizontal } from "lucide-react"
import { PolicyPage, type PolicySection, type PolicySummaryItem } from "@/components/policy-page"

export const metadata: Metadata = {
  title: "Cookie Policy | Shikkha Buddy",
  alternates: { canonical: "/cookies" },
  description: "How Shikkha Buddy uses essential browser storage and cookies during beta.",
  openGraph: {
    title: "Cookie Policy | Shikkha Buddy",
    description: "How Shikkha Buddy uses essential browser storage and cookies during beta.",
  },
  twitter: {
    card: "summary",
    title: "Cookie Policy | Shikkha Buddy",
    description: "How Shikkha Buddy uses essential browser storage and cookies during beta.",
  },
}

const summary: PolicySummaryItem[] = [
  {
    title: "Essential use only",
    description: "Used for sign-in, security, preferences, and platform operation.",
    icon: Cookie,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "No ad cookies",
    description: "No advertising, marketing, or retargeting during the free beta.",
    icon: Ban,
    iconClassName: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Browser controls",
    description: "You can block or delete cookies and local browser storage.",
    icon: SlidersHorizontal,
    iconClassName: "bg-violet-500/10 text-violet-700",
  },
  {
    title: "Policy updates",
    description: "We will update this policy before introducing new tracking or checkout tools.",
    icon: FileText,
    iconClassName: "bg-orange-500/10 text-orange-600",
  },
]

const sections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "This Cookie Policy explains how Shikkha Buddy uses cookies, local storage, session storage, and similar browser technologies to operate the website and beta platform.",
      "Cookies are small files stored by your browser. Browser storage, such as local storage and session storage, can keep information on your device so the platform can remember sign-in state, preferences, and technical settings.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use essential browser storage",
    items: [
      "Keep users signed in when they choose to use an account.",
      "Support account, navigation, practice-session, and preference features.",
      "Help protect accounts and the platform from misuse.",
      "Improve reliability and troubleshoot technical issues.",
    ],
  },
  {
    id: "types",
    title: "Types of storage we use",
    groups: [
      {
        title: "Essential cookies and storage",
        items: [
          "These are needed for the website and platform to work properly. Without them, sign-in, navigation, security, and practice-session features may not work as expected.",
        ],
      },
      {
        title: "Authentication and session storage",
        items: [
          "Shikkha Buddy may store sign-in or short-lived session information in the browser so users can access protected parts of the platform after signing in.",
        ],
      },
      {
        title: "Preferences and reliability storage",
        items: [
          "This may remember basic interface preferences and help detect errors, prevent abuse, protect accounts, and keep the platform stable.",
        ],
      },
    ],
  },
  {
    id: "not-used",
    title: "What we do not use during the free beta",
    items: [
      "Advertising cookies or third-party advertising profiles.",
      "Marketing pixels, retargeting cookies, paid conversion tracking, or payment checkout cookies.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party technologies",
    paragraphs: [
      "Technical providers that operate hosting, infrastructure, security, email, databases, or support systems may process limited technical data as part of providing those services.",
      "Shikkha Buddy does not use third-party advertising cookies, paid conversion tracking, or retargeting pixels during the beta.",
    ],
  },
  {
    id: "controls",
    title: "How you can control browser storage",
    paragraphs: [
      "You can control cookies and browser storage through your browser settings. Most browsers let you block or delete cookies, clear local storage, or limit tracking technologies.",
      "Blocking or deleting essential cookies or browser storage may cause sign-in, account, or practice features to stop working correctly.",
    ],
  },
  {
    id: "updates-contact",
    title: "Changes and contact",
    paragraphs: [
      "We may update this Cookie Policy as the platform, beta features, and operations change. We will update it before introducing new tracking, advertising, checkout, or payment tools.",
      "For cookie, privacy, support, deletion, or policy questions, use the Contact page.",
    ],
  },
]

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      title="Cookie Policy"
      updatedAt="July 16, 2026"
      description="How Shikkha Buddy uses essential browser storage and similar technologies to operate the website and beta platform."
      summary={summary}
      sections={sections}
      ctaTitle="Need help with cookies or privacy?"
      ctaDescription="Use the Contact page for cookie, privacy, support, deletion, or policy questions."
      secondaryLink={{ href: "/privacy", label: "Privacy Policy" }}
    />
  )
}
