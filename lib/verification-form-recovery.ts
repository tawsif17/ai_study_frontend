import { ApiClientError } from "@/lib/api/client"

export function normalizeVerificationEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidVerificationEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeVerificationEmail(email))
}

export type VerificationRecoveryKind =
  | "invalid"
  | "expired"
  | "used"
  | "already-verified"
  | "rate-limited"
  | "transient"
  | "unknown"

export interface VerificationRecovery {
  kind: VerificationRecoveryKind
  title: string
  message: string
  retryable: boolean
  nextAction: "resend" | "login" | null
}

const permanentRecoveryByMessage: Record<string, VerificationRecovery> = {
  "invalid verification token": {
    kind: "invalid",
    title: "Invalid verification link",
    message: "This verification link is invalid. Request a new email to continue.",
    retryable: false,
    nextAction: "resend",
  },
  "verification token expired": {
    kind: "expired",
    title: "Verification link expired",
    message: "This verification link has expired. Request a new email to continue.",
    retryable: false,
    nextAction: "resend",
  },
  "verification token already used": {
    kind: "used",
    title: "Verification link already used",
    message: "This verification link has already been used. Try signing in to your account.",
    retryable: false,
    nextAction: "login",
  },
  "email already verified": {
    kind: "already-verified",
    title: "Email already verified",
    message: "Your email is already verified. You can sign in to your account.",
    retryable: false,
    nextAction: "login",
  },
}

export function mapVerificationRecovery(error: unknown): VerificationRecovery {
  if (error instanceof ApiClientError) {
    const matched = permanentRecoveryByMessage[error.message.trim().toLowerCase()]
    if (matched) return matched

    if (error.status === 429) {
      return {
        kind: "rate-limited",
        title: "Too many verification attempts",
        message: "Please wait a minute before trying this verification link again.",
        retryable: true,
        nextAction: null,
      }
    }

    if (error.status >= 500 || error.status === 408) {
      return {
        kind: "transient",
        title: "Verification temporarily unavailable",
        message: "We couldn't verify your email right now. Please try again.",
        retryable: true,
        nextAction: null,
      }
    }

    return {
      kind: "unknown",
      title: "Verification failed",
      message: "We couldn't use this verification link. Request a new email to continue.",
      retryable: false,
      nextAction: "resend",
    }
  }

  return {
    kind: "transient",
    title: "Verification temporarily unavailable",
    message: "We couldn't verify your email right now. Check your connection and try again.",
    retryable: true,
    nextAction: null,
  }
}

export function isUncertainSignupDeliveryError(error: unknown): boolean {
  return !(error instanceof ApiClientError) || error.status === 408 || error.status >= 500
}
