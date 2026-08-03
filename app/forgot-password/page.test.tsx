import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import ForgotPasswordPage from "./page"
import { forgotPassword } from "@/lib/api"
import { ApiClientError, ApiNetworkError } from "@/lib/api/client"
import { getPasswordResetCooldownStorageKey } from "@/lib/password-recovery"

vi.mock("@/components/page-shell", () => ({ PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
vi.mock("@/lib/api", () => ({ forgotPassword: vi.fn() }))

describe("forgot password page", () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })
  it("normalizes email, preserves generic confirmation, and starts a cooldown", async () => {
    vi.mocked(forgotPassword).mockResolvedValueOnce({ message: "If the account is eligible, a password reset email has been sent." })
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " Student@Example.COM " } })
    fireEvent.click(screen.getByRole("button", { name: "Send password reset link" }))
    await waitFor(() => expect(forgotPassword).toHaveBeenCalledWith({ email: "student@example.com" }))
    expect(screen.getByText("If the account is eligible, a password reset email has been sent.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Send again in/ })).toBeDisabled()
  })
  it("shows an accessible field error without sending an invalid email", async () => {
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } })
    fireEvent.click(screen.getByRole("button", { name: "Send password reset link" }))
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(forgotPassword).not.toHaveBeenCalled()
  })
  it("uses safe messages for server and connection failures and clears them on edit", async () => {
    vi.mocked(forgotPassword)
      .mockRejectedValueOnce(new ApiClientError({ message: "Database details" }, 500))
      .mockRejectedValueOnce(new ApiNetworkError())
    render(<ForgotPasswordPage />)
    const email = screen.getByLabelText("Email")
    fireEvent.change(email, { target: { value: "student@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Send password reset link" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.")
    fireEvent.change(email, { target: { value: "other@example.com" } })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Send password reset link" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not reach Shikkha Buddy. Check your connection and try again."
    )
  })
  it("restores the per-email cooldown after a reload", async () => {
    const email = "student@example.com"
    window.localStorage.setItem(
      getPasswordResetCooldownStorageKey(email),
      String(Date.now() + 60_000)
    )
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } })
    expect(await screen.findByRole("button", { name: /Send again in/ })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: /Send again in/ }))
    expect(forgotPassword).not.toHaveBeenCalled()
  })
  it("has no detectable accessibility violations", async () => { const { container } = render(<ForgotPasswordPage />); expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([]) })
})
