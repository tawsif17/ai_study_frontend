import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import LoginPage from "./page"
import { ApiClientError } from "@/lib/api/client"

const mockPush = vi.fn()
const mockGet = vi.fn()
const mockLogin = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

describe("login page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockImplementation((key: string) => {
      if (key === "registered") return "false"
      if (key === "email") return ""
      return null
    })
  })

  it("shows resend CTA when login fails with unverified email", async () => {
    mockLogin.mockRejectedValueOnce(
      new ApiClientError({ message: "Email verification required" }, 403)
    )
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
        "href",
        "/resend-verification?email=student%40example.com"
      )
    })
  })

  it("normalizes the email before login and validates empty fields accessibly", async () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Enter a valid email address.")).toHaveAttribute("id", "login-email-error")
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true")
    expect(mockLogin).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " Student@Example.COM " } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "password123",
      })
    })
  })

  it("does not show resend CTA for an unrelated unauthorized response", async () => {
    mockLogin.mockRejectedValueOnce(new ApiClientError({ message: "Invalid email or password" }, 401))
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password")
    })
    expect(screen.queryByRole("link", { name: "Resend verification email" })).not.toBeInTheDocument()
  })

  it("shows verification guidance for the legacy registration notice", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "registered") return "true"
      if (key === "email") return "student@example.com"
      return null
    })

    render(<LoginPage />)

    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Check your email")
    expect(status).toHaveTextContent("Registration successful. Check your email and verify your account before signing in.")
    expect(screen.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
      "href",
      "/resend-verification?email=student%40example.com"
    )
  })

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<LoginPage />)
    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
