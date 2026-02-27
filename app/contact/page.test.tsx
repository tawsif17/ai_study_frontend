import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type React from "react"
import ContactPage from "./page"
import { submitContact } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/lib/api", () => ({
  submitContact: vi.fn(),
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

describe("contact page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })
  })

  it("renders empty state with disabled submit until form is valid", () => {
    render(<ContactPage />)

    expect(screen.getByLabelText("Name")).toHaveValue("")
    expect(screen.getByLabelText("Email")).toHaveValue("")
    expect(screen.getByLabelText("Message")).toHaveValue("")
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()
  })

  it("prefills name and email for authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "1",
        email: "student@example.com",
        full_name: "Student Name",
        role: "student",
        plan_tier: "free",
        school: null,
        city: null,
        student_class: null,
        email_verified_at: null,
        last_login_at: null,
        created_at: "2026-02-27T00:00:00.000Z",
        updated_at: "2026-02-27T00:00:00.000Z",
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })

    render(<ContactPage />)

    expect(screen.getByLabelText("Name")).toHaveValue("Student Name")
    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    expect(screen.getByLabelText("Message")).toHaveValue("")
    expect(screen.getByLabelText("Name")).toHaveAttribute("readonly")
    expect(screen.getByLabelText("Email")).toHaveAttribute("readonly")
  })

  it("submits valid form data and renders success state", async () => {
    vi.mocked(submitContact).mockResolvedValueOnce({
      message: "Contact message submitted successfully.",
    })

    render(<ContactPage />)

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help with the platform." },
    })

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => {
      expect(submitContact).toHaveBeenCalledWith({
        name: "Student Name",
        email: "student@example.com",
        message: "I need help with the platform.",
      })
    })

    expect(screen.getByText("Contact message submitted successfully.")).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("")
    expect(screen.getByLabelText("Email")).toHaveValue("")
    expect(screen.getByLabelText("Message")).toHaveValue("")
  })

  it("shows backend validation errors and preserves form values", async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(new Error("Name is required"))

    render(<ContactPage />)

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help with the platform." },
    })

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument()
    })

    expect(screen.getByLabelText("Name")).toHaveValue("Student Name")
    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    expect(screen.getByLabelText("Message")).toHaveValue("I need help with the platform.")
  })

  it("shows rate limit errors", async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(
      new Error("Too many requests. Please try again later.")
    )

    render(<ContactPage />)

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help with the platform." },
    })

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => {
      expect(screen.getByText("Too many requests. Please try again later.")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    let resolveSubmit: ((value: { message: string }) => void) | undefined
    vi.mocked(submitContact).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        })
    )

    render(<ContactPage />)

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help with the platform." },
    })

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled()

    resolveSubmit?.({ message: "Contact message submitted successfully." })

    await waitFor(() => {
      expect(screen.getByText("Contact message submitted successfully.")).toBeInTheDocument()
    })
  })
})
