import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import ResetPasswordPage from "./page"
import { resetPassword } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"

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
  it("has no detectable accessibility violations", async () => { const { container } = render(<ResetPasswordPage />); expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([]) })
})
