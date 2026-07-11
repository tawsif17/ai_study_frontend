import type { Metadata } from "next"
import { SubjectsContent } from "./subjects-content"

export const metadata: Metadata = {
  title: "Practice | Shikkha Buddy",
  description: "Choose an SSC subject, then select chapters and start focused MCQ practice in Shikkha Buddy.",
  openGraph: {
    title: "Practice | Shikkha Buddy",
    description: "Choose an SSC subject, then select chapters and start focused MCQ practice in Shikkha Buddy.",
  },
  twitter: {
    card: "summary",
    title: "Practice | Shikkha Buddy",
    description: "Choose an SSC subject, then select chapters and start focused MCQ practice in Shikkha Buddy.",
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
