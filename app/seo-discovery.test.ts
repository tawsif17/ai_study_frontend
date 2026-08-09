import { describe, expect, it } from "vitest"
import { metadata as rootMetadata } from "./layout"
import { aboutSections, metadata as aboutMetadata } from "./about/page"
import robots from "./robots"
import sitemap from "./sitemap"
import { metadata as subjectsMetadata } from "./subjects/page"

describe("public search discovery signals", () => {
  it("uses the HTTPS apex domain as the metadata base and canonical public routes", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe("https://shikkhabuddy.com/")
    expect(aboutMetadata.alternates).toEqual({ canonical: "/about" })
    expect(subjectsMetadata.alternates).toEqual({ canonical: "/subjects" })
  })

  it("describes the public subject catalog with specific SSC search language", () => {
    expect(subjectsMetadata.title).toBe(
      "SSC Mathematics, Physics & Chemistry MCQ Practice | Shikkha Buddy"
    )
    expect(subjectsMetadata.description).toContain("SSC Mathematics, Physics, or Chemistry")
  })

  it("keeps About claims factual and specific to the current product", () => {
    expect(aboutSections[0]).toMatchObject({ title: "What Shikkha Buddy is" })
    expect(aboutSections[0].body).toContain("Bangladesh-focused SSC MCQ practice platform")
    expect(aboutSections[0].body).toContain("AI-generated questions")
    expect(aboutSections[0].body).not.toMatch(/founder|award|rating|reviewed by/i)
  })

  it("publishes core public pages while keeping private routes out of crawler access", () => {
    const sitemapPaths = sitemap().map((entry) => new URL(entry.url).pathname)
    const rules = robots().rules
    const disallow = Array.isArray(rules) ? rules[0]?.disallow : rules.disallow

    expect(sitemapPaths).toEqual(
      expect.arrayContaining(["/", "/subjects", "/how-it-works", "/faq", "/about"])
    )
    expect(disallow).not.toContain("/")
    expect(disallow).toEqual(expect.arrayContaining(["/dashboard", "/profile", "/practice"]))
  })
})
