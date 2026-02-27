import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
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
      new ApiClientError({ message: "Email verification required" }, 401)
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
})
