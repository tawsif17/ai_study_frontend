const DEFAULT_NEXT_PATH = "/subjects"

/**
 * Restricts post-auth navigation to an internal path. This rejects protocol-relative
 * URLs, Windows-style paths, and invisible control characters that can be interpreted
 * differently by a browser or proxy.
 */
export function getSafeNextPath(value: string | null, fallback = DEFAULT_NEXT_PATH): string {
  const nextPath = value?.trim()

  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(nextPath) ||
    /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(nextPath)
  ) {
    return fallback
  }

  // Decode repeatedly to catch double-encoded separators and controls. A malformed
  // escape is rejected rather than passed to a router with implementation-specific behavior.
  let decoded = nextPath
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      const nextDecoded = decodeURIComponent(decoded)
      if (nextDecoded === decoded) break
      decoded = nextDecoded
      if (
        decoded.startsWith("//") ||
        decoded.includes("\\") ||
        /[\u0000-\u001F\u007F]/.test(decoded)
      ) {
        return fallback
      }
    }
  } catch {
    return fallback
  }

  try {
    const parsed = new URL(nextPath, "https://shikkhabuddy.invalid")
    if (parsed.origin !== "https://shikkhabuddy.invalid") return fallback
  } catch {
    return fallback
  }

  return nextPath
}
