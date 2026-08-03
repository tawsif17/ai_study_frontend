import { describe, expect, it } from "vitest"
import { getSafeNextPath } from "./safe-next-path"

describe("getSafeNextPath", () => {
  it("keeps internal return paths, including their query strings", () => {
    expect(getSafeNextPath("/subjects/5?mode=MCQ")).toBe("/subjects/5?mode=MCQ")
    expect(getSafeNextPath("/practice/12#question-3")).toBe("/practice/12#question-3")
  })

  it.each([
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/subjects\\..\\example.com",
    "/%2f%2fexample.com",
    "/%252f%252fexample.com",
    "/%5cexample.com",
    "/subjects%0aSet-Cookie:bad",
    "/subjects\nSet-Cookie: bad",
    "/subjects/%zz",
    "  ",
  ]) (
    "falls back for unsafe value %j",
    (value) => {
      expect(getSafeNextPath(value)).toBe("/subjects")
    }
  )

  it("uses the caller's fallback for rejected values", () => {
    expect(getSafeNextPath("//example.com", "/login")).toBe("/login")
  })
})
