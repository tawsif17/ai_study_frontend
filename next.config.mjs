const DEFAULT_SITE_URL = "https://shikkhabuddy.com"
const DEVELOPMENT_API_URL = "http://localhost:3001/api"

function parseAbsoluteUrl(name, value, { requireHttps }) {
  if (!value) {
    throw new Error(`${name} is required in production.`)
  }

  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be an absolute URL.`)
  }

  if ((requireHttps && parsed.protocol !== "https:") || (!requireHttps && !["http:", "https:"].includes(parsed.protocol))) {
    throw new Error(`${name} must use ${requireHttps ? "HTTPS" : "HTTP or HTTPS"}.`)
  }

  const hostname = parsed.hostname.toLowerCase()
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "[::1]"

  if (!parsed.hostname || parsed.username || parsed.password || (requireHttps && isLocalhost)) {
    throw new Error(`${name} must be a public absolute URL without credentials.`)
  }

  return parsed
}

export function resolvePublicEnvironment(environment = process.env) {
  const isProduction = environment.NODE_ENV === "production"
  const apiUrl = parseAbsoluteUrl(
    "NEXT_PUBLIC_API_BASE_URL",
    environment.NEXT_PUBLIC_API_BASE_URL ?? (isProduction ? undefined : DEVELOPMENT_API_URL),
    { requireHttps: isProduction },
  )
  const siteUrl = parseAbsoluteUrl(
    "NEXT_PUBLIC_SITE_URL",
    environment.NEXT_PUBLIC_SITE_URL ?? (isProduction ? undefined : DEFAULT_SITE_URL),
    { requireHttps: isProduction },
  )

  return { apiOrigin: apiUrl.origin, siteUrl: siteUrl.toString(), isProduction }
}

export function buildContentSecurityPolicy(
  apiOrigin,
  { upgradeInsecureRequests = true, allowDevelopmentRuntime = false } = {},
) {
  // Next.js nonce CSP requires dynamic rendering. The beta remains statically rendered for
  // predictable caching and hosting cost, so production temporarily permits inline scripts.
  // https://nextjs.org/docs/app/guides/content-security-policy
  const scriptSource = allowDevelopmentRuntime
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'"
  const developmentConnections = allowDevelopmentRuntime
    ? " ws://localhost:* ws://127.0.0.1:*"
    : ""
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `img-src 'self' data: blob: ${apiOrigin}`,
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    scriptSource,
    `connect-src 'self' ${apiOrigin}${developmentConnections}`,
  ]
  if (upgradeInsecureRequests) directives.push("upgrade-insecure-requests")
  return directives.join("; ")
}

export function buildSecurityHeaders(apiOrigin, { isProduction }) {
  const headers = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(apiOrigin, {
        upgradeInsecureRequests: isProduction,
        allowDevelopmentRuntime: !isProduction,
      }),
    },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=()" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
  ]

  if (isProduction) {
    headers.splice(1, 0, {
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    })
  }

  return headers
}

const { apiOrigin, isProduction } = resolvePublicEnvironment()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(apiOrigin, { isProduction }),
      },
    ]
  },
}

export default nextConfig
