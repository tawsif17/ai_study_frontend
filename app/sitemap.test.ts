import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import sitemap from "./sitemap"

describe("sitemap", () => {
  it("publishes the approved policy routes without retired beta policy routes", () => {
    const routes = sitemap().map((entry) => new URL(entry.url).pathname)

    expect(routes).toEqual(expect.arrayContaining(["/privacy", "/terms", "/cookies"]))
    expect(routes).not.toEqual(expect.arrayContaining(["/data-protection", "/ai-disclaimer", "/data-deletion", "/refund-policy"]))
  })

  it("has no page files for retired beta policy routes", () => {
    for (const route of ["data-protection", "ai-disclaimer", "data-deletion"]) {
      expect(existsSync(path.join(process.cwd(), "app", route, "page.tsx"))).toBe(false)
    }
  })
})
