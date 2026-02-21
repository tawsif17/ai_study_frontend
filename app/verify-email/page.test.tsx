import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type React from "react"
import VerifyEmailPage from "./page"
import { verifyEmail } from "@/lib/api"

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
    expect(screen.getByText("Email verified successfully")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login")
  })
})
