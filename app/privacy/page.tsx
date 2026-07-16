import type { Metadata } from "next"
import { CreditCard, ShieldCheck, UserRoundCheck, UserRoundCog } from "lucide-react"
import { PolicyPage, type PolicySection, type PolicySummaryItem } from "@/components/policy-page"

export const metadata: Metadata = {
  title: "Privacy Policy | Shikkha Buddy",
  description: "How Shikkha Buddy handles account, learning, support, and technical information during beta.",
  openGraph: {
    title: "Privacy Policy | Shikkha Buddy",
    description: "How Shikkha Buddy handles account, learning, support, and technical information during beta.",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Shikkha Buddy",
    description: "How Shikkha Buddy handles account, learning, support, and technical information during beta.",
  },
}

const summary: PolicySummaryItem[] = [
  {
    title: "Student privacy first",
    description: "Designed for SSC students, including younger users who need guardian support.",
    icon: ShieldCheck,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "No selling data",
    description: "Shikkha Buddy does not sell student personal information.",
    icon: UserRoundCheck,
    iconClassName: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Free beta payment note",
    description: "The platform does not collect payment or billing information during beta.",
    icon: CreditCard,
    iconClassName: "bg-violet-500/10 text-violet-700",
  },
  {
    title: "User requests",
    description: "Ask for account access, correction, or deletion through Contact.",
    icon: UserRoundCog,
    iconClassName: "bg-orange-500/10 text-orange-600",
  },
]

const sections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "This Privacy Policy explains what information Shikkha Buddy collects, how we use it, and how you can request access, correction, or deletion.",
      "Shikkha Buddy is an SSC practice platform for students in Bangladesh. The current beta focuses on General Math, Physics, and Chemistry.",
    ],
  },
  {
    id: "information-collected",
    title: "Information we collect",
    groups: [
      {
        title: "Account and sign-up information",
        items: [
          "Name, email address, password in protected hashed form, and school, city, or class information when provided.",
          "Beta access or sign-up request information when you submit it.",
        ],
      },
      {
        title: "Learning and support information",
        items: [
          "Selected subjects, chapters, practice sessions, submitted answers, scores, explanations viewed, and session history where those features are used.",
          "Support messages, question reports, account requests, and policy requests you send to us.",
        ],
      },
      {
        title: "Device, browser, and technical information",
        items: [
          "Browser and device information, general technical data, IP address or network information used for security and abuse prevention, and technical event data such as request time, pages used, errors, and security events.",
          "Browser storage needed for sign-in, preferences, and essential platform operation.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    items: [
      "Create and manage accounts and provide SSC practice sessions.",
      "Save answers, scores, progress, bookmarks, and other learning activity where available.",
      "Provide explanations, revision guidance, and Beta Pro features such as Board-only MCQ sets and Weak Area Analysis for verified beta users.",
      "Respond to support, contact, deletion, and policy requests.",
      "Protect accounts, prevent abuse, and maintain the reliability and security of the platform.",
    ],
  },
  {
    id: "student-privacy",
    title: "Student privacy",
    paragraphs: [
      "Shikkha Buddy is designed for SSC students, including users who may be under 18. Parents or guardians should support younger students with account creation, platform use, and requests about personal information.",
      "Please do not submit highly sensitive personal information that is not needed for support or safety, such as financial details, medical details, national ID numbers, passwords, or family-sensitive information.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    paragraphs: ["Shikkha Buddy does not sell student personal information."],
    items: [
      "Technical service providers that help operate hosting, infrastructure, security, email, databases, or support systems may process limited information needed to provide those services.",
      "Authorities or other parties may receive information when required for legal, safety, fraud-prevention, or security reasons.",
    ],
  },
  {
    id: "retention-security",
    title: "Retention and security",
    paragraphs: [
      "We keep information for as long as reasonably needed to provide the platform, support users, maintain security, resolve disputes, and meet applicable legal or operational requirements.",
      "We use reasonable technical and organisational measures to protect information, but no online platform can guarantee perfect security. Keep your password private and contact us if you believe your account has been accessed without permission.",
    ],
  },
  {
    id: "choices",
    title: "Your choices and requests",
    items: [
      "Ask to access or correct account information.",
      "Ask for account or data deletion through the Contact page.",
      "Ask for help with login, account access, content reports, or privacy questions.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    paragraphs: [
      "Shikkha Buddy uses essential browser storage for sign-in, preferences, security, and reliable platform operation. We do not use advertising, marketing, paid conversion tracking, or retargeting cookies during the beta.",
      "Read the Cookie Policy for more detail about browser controls and essential storage.",
    ],
  },
  {
    id: "updates-contact",
    title: "Changes and contact",
    paragraphs: [
      "We may update this Privacy Policy as the platform, beta features, and operations change. Updated versions will be posted here with a new Last updated date.",
      "For privacy, support, deletion, or policy questions, use the Contact page.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updatedAt="July 16, 2026"
      description="A plain-language overview of what information Shikkha Buddy collects, how it is used, and how you can request access, correction, or deletion."
      summary={summary}
      sections={sections}
      ctaTitle="Need help with privacy or deletion?"
      ctaDescription="Use the Contact page to ask about account information, correction, deletion, or another policy question."
      secondaryLink={{ href: "/cookies", label: "Cookie Policy" }}
    />
  )
}
