import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import SignupPage from "./page"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()
const mockRegister = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: React.PropsWithChildren<{
    value: string
    onValueChange: (value: string) => void
    disabled?: boolean
  }>) => (
    <select
      id="class"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      disabled={disabled}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ value, children }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren<{ id?: string }>) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

function fillValidSignupForm() {
  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Student Name" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123" } })
  fireEvent.change(screen.getByLabelText("School Name"), {
    target: { value: "Example High School" },
  })
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Dhaka" } })
  fireEvent.change(screen.getByLabelText("Class"), { target: { value: "10" } })
}

describe("signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
  })

  it("shows check-email guidance when a closed beta account is created", async () => {
    mockRegister.mockResolvedValueOnce({
      data: { message: "Registration successful. Please check your email to verify your account." },
      status: 201,
    })

    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "Password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
      })
    })
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument()
    expect(screen.getByText(/student@example.com/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
      "href",
      "/resend-verification?email=student%40example.com"
    )
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute(
      "href",
      "/login?email=student%40example.com"
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows private beta success in place when signup interest is captured", async () => {
    mockRegister.mockResolvedValueOnce({
      data: {
        message:
          "Thank you for your interest! We're currently in a private beta and are gradually inviting new users. We've received your request and will contact you as soon as access becomes available.",
      },
      status: 202,
    })

    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Request received")
    expect(
      screen.getByText(/Thank you for your interest! We're currently in a private beta/)
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toHaveValue("")
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows API errors and re-enables submit", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Email is already registered"))

    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Email is already registered")
    expect(screen.getByRole("button", { name: "Create Account" })).toBeEnabled()
  })

  it("disables form controls while submitting", async () => {
    let resolveRegister: ((value: { data: { message: string }; status: 202 }) => void) | undefined
    mockRegister.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve
        })
    )

    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(screen.getByRole("button", { name: "Creating account..." })).toBeDisabled()
    expect(screen.getByLabelText("Full Name")).toBeDisabled()
    expect(screen.getByLabelText("Email")).toBeDisabled()
    expect(screen.getByLabelText("Password")).toBeDisabled()
    expect(screen.getByLabelText("School Name")).toBeDisabled()
    expect(screen.getByLabelText("City")).toBeDisabled()
    expect(screen.getByLabelText("Class")).toBeDisabled()

    resolveRegister?.({
      data: { message: "Thank you for your interest!" },
      status: 202,
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Account" })).toBeEnabled()
    })
  })

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<SignupPage />)
    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
