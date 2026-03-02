import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

// Updated metadata for Shikkha Buddy
export const metadata: Metadata = {
  title: "Shikkha Buddy - SSC Higher Math, Physics & Chemistry Practice",
  description:
    "AI-powered practice platform for SSC students in Bangladesh. Master Higher Math, Physics & Chemistry with mock tests, past papers and instant explanations.",
  generator: "v0.app",
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
