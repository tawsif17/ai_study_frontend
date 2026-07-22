import { describe, expect, it } from "vitest"
import { getSafeNextPath } from "./safe-next-path"

describe("getSafeNextPath", () => {
  it("keeps internal return paths, including their query strings", () => {
    expect(getSafeNextPath("/subjects/5?mode=MCQ")).toBe("/subjects/5?mode=MCQ")
  })

  it.each(["https://example.com", "//example.com", "/\\example.com", "/subjects\nSet-Cookie: bad", "  "]) (
    "falls back for unsafe value %j",
    (value) => {
      expect(getSafeNextPath(value)).toBe("/subjects")
    }
  )
})
