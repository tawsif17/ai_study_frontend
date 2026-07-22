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
    nextPath.startsWith("/\\") ||
    /[\u0000-\u001F\u007F]/.test(nextPath)
  ) {
    return fallback
  }

  return nextPath
}
