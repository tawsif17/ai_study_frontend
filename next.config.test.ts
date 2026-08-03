import { describe, expect, it } from "vitest"
import nextConfig, {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  resolvePublicEnvironment,
} from "./next.config.mjs"

describe("production security configuration", () => {
  it("requires absolute HTTPS public URLs in production", () => {
    expect(() => resolvePublicEnvironment({ NODE_ENV: "production" })).toThrow("NEXT_PUBLIC_API_BASE_URL")
    expect(() => resolvePublicEnvironment({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_BASE_URL: "http://api.example.com/api",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    })).toThrow("must use HTTPS")
    expect(() => resolvePublicEnvironment({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_BASE_URL: "https://localhost:3001/api",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    })).toThrow("public absolute URL")
  })

  it("restricts the CSP to the configured API origin", () => {
    const policy = buildContentSecurityPolicy("https://api.example.com")

    expect(policy).toContain("connect-src 'self' https://api.example.com")
    expect(policy).toContain("upgrade-insecure-requests")
    expect(policy).toContain("script-src 'self' 'unsafe-inline'")
    expect(policy).not.toContain("unsafe-eval")
    expect(policy).not.toMatch(/(?:^| )https:(?: |;|$)/)
    expect(policy).not.toContain("localhost")
  })

  it("sets production-only one-year HSTS without preload and preserves unoptimized images", () => {
    const productionHeaders = buildSecurityHeaders("https://api.example.com", { isProduction: true })
    const developmentHeaders = buildSecurityHeaders("http://localhost:3001", { isProduction: false })
    const hsts = productionHeaders.find((header) => header.key === "Strict-Transport-Security")?.value

    expect(nextConfig.images?.unoptimized).toBe(true)
    expect(hsts).toContain("max-age=31536000")
    expect(hsts).not.toContain("preload")
    expect(developmentHeaders.some((header) => header.key === "Strict-Transport-Security")).toBe(false)
  })

  it("does not upgrade the HTTP localhost API during development", () => {
    const policy = buildContentSecurityPolicy("http://localhost:3001", { upgradeInsecureRequests: false })

    expect(policy).toContain("connect-src 'self' http://localhost:3001")
    expect(policy).not.toContain("upgrade-insecure-requests")
  })
})
