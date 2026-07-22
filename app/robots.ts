import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shikkhabuddy.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/bookmarks", "/dashboard", "/login", "/practice", "/profile", "/pricing/success", "/resend-verification", "/signup", "/verify-email"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
