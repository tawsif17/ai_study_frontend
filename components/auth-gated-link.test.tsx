import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthGatedLink } from "./auth-gated-link"
import { useAuth, type AuthStatus } from "@/lib/auth-context"

vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))

function mockAuth(isAuthenticated: boolean, authStatus: AuthStatus) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    isLoading: authStatus === "loading",
    authStatus,
    authError: null,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    retryAuth: vi.fn(),
  })
}

describe("AuthGatedLink", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth(false, "unauthenticated")
  })

  it("uses the signed-out label and configured destination", () => {
    render(
      <AuthGatedLink
        href="/subjects"
        unauthenticatedHref="/signup"
        authenticatedChildren="Practice"
      >
        Start free
      </AuthGatedLink>
    )

    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/signup")
  })

  it("uses the authenticated label and practice destination", () => {
    mockAuth(true, "authenticated")
    render(
      <AuthGatedLink
        href="/subjects"
        unauthenticatedHref="/signup"
        authenticatedChildren="Practice"
      >
        Start free
      </AuthGatedLink>
    )

    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute("href", "/subjects")
  })

  it("keeps the signed-out wording while authentication is loading", () => {
    mockAuth(false, "loading")
    render(
      <AuthGatedLink href="/subjects" authenticatedChildren="Practice">
        Start free
      </AuthGatedLink>
    )

    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/subjects")
  })

  it("keeps the authenticated wording during a recoverable refresh failure", () => {
    mockAuth(true, "retryable-refresh-error")
    render(
      <AuthGatedLink href="/subjects" authenticatedChildren="Practice">
        Start free
      </AuthGatedLink>
    )

    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute("href", "/subjects")
  })
})
