import type { Metadata } from "next"
import { SubjectsContent } from "./subjects-content"

export const metadata: Metadata = {
  title: "Subjects | Shikkha Buddy",
  description: "Choose an available SSC science subject and start focused practice in Shikkha Buddy.",
  openGraph: {
    title: "Subjects | Shikkha Buddy",
    description: "Choose an available SSC science subject and start focused practice in Shikkha Buddy.",
  },
  twitter: {
    card: "summary",
    title: "Subjects | Shikkha Buddy",
    description: "Choose an available SSC science subject and start focused practice in Shikkha Buddy.",
  },
}

export default function SubjectsPage() {
  return <SubjectsContent />
}
