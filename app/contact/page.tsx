import type { Metadata } from "next"
import { ContactContent } from "./contact-content"

export const metadata: Metadata = {
  title: "Contact | Shikkha Buddy",
  description: "Contact Shikkha Buddy for account or SSC practice support.",
  openGraph: {
    title: "Contact | Shikkha Buddy",
    description: "Contact Shikkha Buddy for account or SSC practice support.",
  },
  twitter: {
    card: "summary",
    title: "Contact | Shikkha Buddy",
    description: "Contact Shikkha Buddy for account or SSC practice support.",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
