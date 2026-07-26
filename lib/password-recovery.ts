import { ApiClientError } from "@/lib/api/client"
import { normalizeVerificationEmail } from "@/lib/verification-form-recovery"

export const PASSWORD_RESET_COOLDOWN_MS = 60_000
const RESET_COOLDOWN_PREFIX = "password_reset_cooldown:"

export function getPasswordResetCooldownStorageKey(email: string): string {
  return `${RESET_COOLDOWN_PREFIX}${encodeURIComponent(normalizeVerificationEmail(email))}`
}

export function readPasswordResetCooldownExpiry(email: string): number {
  const normalizedEmail = normalizeVerificationEmail(email)
  if (typeof window === "undefined" || !normalizedEmail) return 0
  const key = getPasswordResetCooldownStorageKey(normalizedEmail)
  const expiresAt = Number.parseInt(window.localStorage.getItem(key) ?? "", 10)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    window.localStorage.removeItem(key)
    return 0
  }
  return expiresAt
}

export function startPasswordResetCooldown(email: string): number {
  const normalizedEmail = normalizeVerificationEmail(email)
  if (typeof window === "undefined" || !normalizedEmail) return 0
  const expiresAt = Date.now() + PASSWORD_RESET_COOLDOWN_MS
  window.localStorage.setItem(getPasswordResetCooldownStorageKey(normalizedEmail), String(expiresAt))
  return expiresAt
}

export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters long"
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/[0-9]/.test(password)) return "Password must contain at least one number"
  return null
}

export type PasswordResetRecovery = {
  title: string
  message: string
  retryable: boolean
  rateLimited: boolean
  nextAction: "forgot" | null
}

const permanentRecoveryByMessage: Record<string, PasswordResetRecovery> = {
  "invalid password reset token": { title: "Invalid reset link", message: "This password reset link is invalid. Request a new one to continue.", retryable: false, rateLimited: false, nextAction: "forgot" },
  "password reset token expired": { title: "Reset link expired", message: "This password reset link has expired. Request a new one to continue.", retryable: false, rateLimited: false, nextAction: "forgot" },
  "password reset token already used": { title: "Reset link already used", message: "This password reset link has already been used. Request a new one if you still need to reset your password.", retryable: false, rateLimited: false, nextAction: "forgot" },
  "new password must be different from current password": { title: "Choose a different password", message: "Your new password must be different from your current password.", retryable: false, rateLimited: false, nextAction: null },
}

export function mapPasswordResetRecovery(error: unknown): PasswordResetRecovery {
  if (error instanceof ApiClientError) {
    const matched = permanentRecoveryByMessage[error.message.trim().toLowerCase()]
    if (matched) return matched
    if (error.status === 429) {
      return { title: "Too many reset attempts", message: "Please wait a minute before trying to reset your password again.", retryable: false, rateLimited: true, nextAction: null }
    }
    if (error.status >= 500 || error.status === 408) {
      return { title: "Password reset temporarily unavailable", message: "We couldn't reset your password right now. Please try again.", retryable: true, rateLimited: false, nextAction: null }
    }
  }
  return { title: "Password reset temporarily unavailable", message: "We couldn't reset your password right now. Check your connection and try again.", retryable: true, rateLimited: false, nextAction: null }
}
