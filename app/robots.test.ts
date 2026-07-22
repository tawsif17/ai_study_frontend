import { describe, expect, it } from "vitest"
import robots from "./robots"
import { metadata as subjectDetailMetadata } from "./subjects/[slug]/layout"

describe("private subject route indexing", () => {
  it("excludes authenticated subject details from crawlers and metadata", () => {
    const rules = robots().rules
    const disallow = Array.isArray(rules) ? rules[0]?.disallow : rules.disallow

    expect(disallow).toContain("/subjects/")
    expect(subjectDetailMetadata.robots).toEqual({ index: false, follow: false })
  })
})
