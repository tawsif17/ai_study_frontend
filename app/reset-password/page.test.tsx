import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import ResetPasswordPage from "./page"
import { resetPassword } from "@/lib/api"
import { ApiClientError, ApiNetworkError } from "@/lib/api/client"

const mockGet = vi.fn()
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: mockGet }) }))
vi.mock("@/components/page-shell", () => ({ PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
vi.mock("@/lib/api", () => ({ resetPassword: vi.fn() }))

describe("reset password page", () => {
  beforeEach(() => { vi.clearAllMocks(); window.history.replaceState({}, "", "/reset-password?token=secret&source=email"); mockGet.mockReturnValue("secret") })
  it("removes the token, resets the password, and links to login", async () => {
    vi.mocked(resetPassword).mockResolvedValueOnce({ message: "Password reset successful. Please log in with your new password." })
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    await waitFor(() => expect(resetPassword).toHaveBeenCalledWith({ token: "secret", newPassword: "NewPassword123" }))
    expect(window.location.search).toBe("?source=email")
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login")
  })
  it("sends permanent token failures to a new-link request", async () => {
    vi.mocked(resetPassword).mockRejectedValueOnce(new ApiClientError({ message: "Password reset token expired" }, 400))
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    expect(await screen.findByText("Reset link expired")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Request a new reset link" })).toHaveAttribute("href", "/forgot-password")
  })
  it.each([
    ["Invalid password reset token", "Invalid reset link"],
    ["Password reset token already used", "Reset link already used"],
  ])("maps %s to permanent recovery", async (backendMessage, heading) => {
    vi.mocked(resetPassword).mockRejectedValueOnce(new ApiClientError({ message: backendMessage }, 400))
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    expect(await screen.findByText(heading)).toBeInTheDocument()
  })
  it("keeps rate-limited reset attempts from retrying immediately", async () => {
    vi.mocked(resetPassword).mockRejectedValueOnce(new ApiClientError({ message: "Too many requests" }, 429))
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    expect(await screen.findByText("Too many reset attempts")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
  })
  it("handles a missing token without rendering the password form", async () => {
    mockGet.mockReturnValue(null)
    render(<ResetPasswordPage />)
    expect(await screen.findByText("Password reset token is missing.")).toBeInTheDocument()
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Request a new reset link" })).toHaveAttribute(
      "href",
      "/forgot-password"
    )
    expect(window.location.search).toBe("?source=email")
  })
  it("validates password requirements and confirmation before submitting", async () => {
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "short" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    expect(await screen.findByText("Password must be at least 8 characters long")).toBeInTheDocument()
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    expect(screen.getByLabelText("New password")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Confirm new password")).toHaveAttribute("aria-invalid", "true")
    expect(resetPassword).not.toHaveBeenCalled()
  })
  it("explains when the new password matches the current password", async () => {
    vi.mocked(resetPassword).mockRejectedValueOnce(
      new ApiClientError({ message: "New password must be different from current password" }, 400)
    )
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    expect(await screen.findByText("Choose a different password")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Request a new reset link" })).not.toBeInTheDocument()
  })
  it("offers and completes a retry after a temporary connection failure", async () => {
    vi.mocked(resetPassword)
      .mockRejectedValueOnce(new ApiNetworkError())
      .mockResolvedValueOnce({ message: "Password reset successful. Please log in with your new password." })
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123" } })
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }))
    const retry = await screen.findByRole("button", { name: "Try again" })
    expect(screen.getByText("Password reset temporarily unavailable")).toBeInTheDocument()
    fireEvent.click(retry)
    expect(await screen.findByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login")
    expect(resetPassword).toHaveBeenCalledTimes(2)
  })
  it("has no detectable accessibility violations", async () => { const { container } = render(<ResetPasswordPage />); expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([]) })
})
