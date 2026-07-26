import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import ForgotPasswordPage from "./page"
import { forgotPassword } from "@/lib/api"

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
  it("has no detectable accessibility violations", async () => { const { container } = render(<ForgotPasswordPage />); expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([]) })
})
