import type { Metadata } from "next"
import { SignupContent } from "./signup-content"

export const metadata: Metadata = {
  title: "Sign Up | Shikkha Buddy",
  description: "Create a Shikkha Buddy account to start focused SSC science practice.",
  openGraph: {
    title: "Sign Up | Shikkha Buddy",
    description: "Create a Shikkha Buddy account to start focused SSC science practice.",
  },
  twitter: {
    card: "summary",
    title: "Sign Up | Shikkha Buddy",
    description: "Create a Shikkha Buddy account to start focused SSC science practice.",
  },
}

export default function SignUpPage() {
  return <SignupContent />
}
