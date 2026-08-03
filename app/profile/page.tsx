import type { Metadata } from "next"
import { ProfileContent } from "./profile-content"

export const metadata: Metadata = {
  title: "Profile | Shikkha Buddy",
  description: "View your Shikkha Buddy account details and choose your next SSC practice step.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfilePage() {
  return <ProfileContent />
}
