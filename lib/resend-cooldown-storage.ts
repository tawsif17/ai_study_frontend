import { normalizeVerificationEmail } from "@/lib/verification-form-recovery"

export const RESEND_COOLDOWN_MS = 60_000
const STORAGE_PREFIX = "verification_resend_cooldown:"

export function getResendCooldownStorageKey(email: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(normalizeVerificationEmail(email))}`
}

export function readResendCooldownExpiry(email: string): number {
  if (typeof window === "undefined" || !normalizeVerificationEmail(email)) return 0

  const key = getResendCooldownStorageKey(email)
  const stored = Number.parseInt(window.localStorage.getItem(key) ?? "", 10)
  if (!Number.isFinite(stored) || stored <= Date.now()) {
    window.localStorage.removeItem(key)
    return 0
  }
  return stored
}

export function startResendCooldown(email: string): number {
  const normalizedEmail = normalizeVerificationEmail(email)
  if (typeof window === "undefined" || !normalizedEmail) return 0

  const expiresAt = Date.now() + RESEND_COOLDOWN_MS
  window.localStorage.setItem(getResendCooldownStorageKey(normalizedEmail), String(expiresAt))
  return expiresAt
}

export function getRemainingCooldownSeconds(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}
