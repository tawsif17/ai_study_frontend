import type { Metadata } from "next"
import { SubjectsContent } from "./subjects-content"

export const metadata: Metadata = {
  title: "SSC Mathematics, Physics & Chemistry MCQ Practice | Shikkha Buddy",
  alternates: { canonical: "/subjects" },
  description: "Choose SSC Mathematics, Physics, or Chemistry, select chapters, and start focused MCQ practice with Shikkha Buddy.",
  openGraph: {
    title: "SSC Mathematics, Physics & Chemistry MCQ Practice | Shikkha Buddy",
    description: "Choose SSC Mathematics, Physics, or Chemistry, select chapters, and start focused MCQ practice with Shikkha Buddy.",
  },
  twitter: {
    card: "summary",
    title: "SSC Mathematics, Physics & Chemistry MCQ Practice | Shikkha Buddy",
    description: "Choose SSC Mathematics, Physics, or Chemistry, select chapters, and start focused MCQ practice with Shikkha Buddy.",
  },
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string | string[] }>
}) {
  const params = await searchParams
  const selectedSubjectValue = typeof params.subject === "string" ? params.subject : null

  return <SubjectsContent selectedSubjectValue={selectedSubjectValue} />
}
