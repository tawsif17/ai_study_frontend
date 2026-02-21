import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ResendVerificationPage from "./page"
import { resendVerification } from "@/lib/api"

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
    vi.mocked(resendVerification).mockRejectedValueOnce(new Error("Invalid email address"))
    render(<ResendVerificationPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bad@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Send verification email" }))

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    })
  })
})
