import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

// Updated metadata for Shikkha Buddy
export const metadata: Metadata = {
  applicationName: "Shikkha Buddy",
  title: "Shikkha Buddy - SSC Science Practice for Bangladesh",
  description:
    "Practice SSC Higher Math, Physics and Chemistry with guided question sessions, explanations, and a focused study flow.",
  openGraph: {
    title: "Shikkha Buddy - SSC Science Practice for Bangladesh",
    description:
      "Practice SSC Higher Math, Physics and Chemistry with guided question sessions, explanations, and a focused study flow.",
    siteName: "Shikkha Buddy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Shikkha Buddy - SSC Science Practice for Bangladesh",
    description:
      "Practice SSC Higher Math, Physics and Chemistry with guided question sessions, explanations, and a focused study flow.",
  },
  icons: {
    icon: "/favicon_48.png",
    shortcut: "/favicon_48.png",
    apple: "/favicon_48.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <AuthProvider>
          <ScrollToTop />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
