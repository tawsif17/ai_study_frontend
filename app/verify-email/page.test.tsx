import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import type React from "react"
import VerifyEmailPage from "./page"
import { verifyEmail } from "@/lib/api"
import { ApiClientError, ApiNetworkError } from "@/lib/api/client"

const mockGet = vi.fn()

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/lib/api", () => ({
  verifyEmail: vi.fn(),
}))

describe("verify email page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, "", "/verify-email?token=test-token&source=email#verify")
  })

  it("shows empty state when token is missing", async () => {
    mockGet.mockReturnValue(null)
    render(<VerifyEmailPage />)

    expect(screen.getByText("Verification token is missing.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
      "href",
      "/resend-verification"
    )
  })

  it("verifies token and renders success state", async () => {
    mockGet.mockReturnValue("valid-token")
    vi.mocked(verifyEmail).mockResolvedValueOnce({ message: "Email verified successfully" })

    render(<VerifyEmailPage />)

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith({ token: "valid-token" })
    })
    expect(window.location.href).not.toContain("token=")
    expect(window.location.search).toBe("?source=email")
    expect(window.location.hash).toBe("#verify")
    expect(await screen.findByText("Email verified successfully")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login")
  })

  it.each([
    ["Invalid verification token", "Invalid verification link", "Resend verification email"],
    ["Verification token expired", "Verification link expired", "Resend verification email"],
    ["Verification token already used", "Verification link already used", "Go to login"],
    ["Email already verified", "Email already verified", "Go to login"],
  ])("maps %s to permanent recovery without retry", async (backendMessage, title, action) => {
    mockGet.mockReturnValue("bad-token")
    vi.mocked(verifyEmail).mockRejectedValueOnce(
      new ApiClientError({ message: backendMessage }, 400)
    )
    render(<VerifyEmailPage />)

    expect(await screen.findByText(title)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: action })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
  })

  it("allows retry for a transient verification failure", async () => {
    mockGet.mockReturnValue("valid-token")
    vi.mocked(verifyEmail)
      .mockRejectedValueOnce(new ApiNetworkError())
      .mockResolvedValueOnce({ message: "Email verified successfully" })
    render(<VerifyEmailPage />)

    const retry = await screen.findByRole("button", { name: "Try again" })
    fireEvent.click(retry)
    expect(await screen.findByText("Email verified successfully")).toBeInTheDocument()
    expect(verifyEmail).toHaveBeenCalledTimes(2)
  })

  it("shows a distinct rate-limit state", async () => {
    mockGet.mockReturnValue("valid-token")
    vi.mocked(verifyEmail).mockRejectedValueOnce(
      new ApiClientError({ message: "Too many requests" }, 429)
    )
    render(<VerifyEmailPage />)

    expect(await screen.findByText("Too many verification attempts")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })

  it("has no detectable accessibility violations", async () => {
    mockGet.mockReturnValue(null)
    const { container } = render(<VerifyEmailPage />)

    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
