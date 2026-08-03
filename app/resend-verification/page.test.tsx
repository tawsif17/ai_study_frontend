import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import ResendVerificationPage from "./page"
import { resendVerification } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"

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
  resendVerification: vi.fn(),
}))

describe("resend verification page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    mockGet.mockImplementation((key: string) => (key === "email" ? "student@example.com" : null))
  })

  it("prefills email from query and submits request", async () => {
    vi.mocked(resendVerification).mockResolvedValueOnce({
      message: "If the account is eligible, a verification email has been sent.",
    })
    render(<ResendVerificationPage />)

    const input = screen.getByLabelText("Email")
    expect(input).toHaveValue("student@example.com")
    fireEvent.click(screen.getByRole("button", { name: "Send verification email" }))

    await waitFor(() => {
      expect(resendVerification).toHaveBeenCalledWith({ email: "student@example.com" })
    })
    expect(
      screen.getByText("If the account is eligible, a verification email has been sent.")
    ).toBeInTheDocument()
  })

  it("shows API error message on failure", async () => {
    vi.mocked(resendVerification).mockRejectedValueOnce(
      new ApiClientError({ message: "Invalid email address" }, 400)
    )
    render(<ResendVerificationPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bad@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Send verification email" }))

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    })
  })

  it("normalizes email and restores the cooldown after remount", async () => {
    mockGet.mockImplementation((key: string) =>
      key === "email" ? " Student@Example.COM " : null
    )
    vi.mocked(resendVerification).mockResolvedValueOnce({ message: "Verification email sent." })
    const firstRender = render(<ResendVerificationPage />)

    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    fireEvent.click(screen.getByRole("button", { name: "Send verification email" }))
    await waitFor(() => {
      expect(resendVerification).toHaveBeenCalledWith({ email: "student@example.com" })
    })
    expect(screen.getByRole("button", { name: /Resend available in/ })).toBeDisabled()

    firstRender.unmount()
    render(<ResendVerificationPage />)
    expect(screen.getByRole("button", { name: /Resend available in/ })).toBeDisabled()
  })

  it("shows and clears an accessible email validation error", () => {
    render(<ResendVerificationPage />)
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalid" } })
    fireEvent.click(screen.getByRole("button", { name: "Send verification email" }))

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Enter a valid email address.")).toHaveAttribute(
      "id",
      "resend-email-error"
    )
    expect(resendVerification).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    expect(screen.queryByText("Enter a valid email address.")).not.toBeInTheDocument()
  })

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ResendVerificationPage />)
    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
