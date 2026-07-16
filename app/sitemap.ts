import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shikkhabuddy.com"

const publicRoutes = [
  "/",
  "/how-it-works",
  "/pricing",
  "/subjects",
  "/contact",
  "/about",
  "/support",
  "/faq",
  "/privacy",
  "/terms",
  "/cookies",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
  }))
}
