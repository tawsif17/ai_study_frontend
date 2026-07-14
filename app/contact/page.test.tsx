import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

function setAuthenticatedUser() {
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
}

function fillGuestForm() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "I need help with the platform." },
  })
}

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

  it("renders the empty, editable guest form and help destinations", () => {
    render(<ContactPage />)

    expect(screen.getByRole("heading", { name: "Get the right help" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("")
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("readonly")
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("readonly")
    expect(screen.getByLabelText("Message")).toHaveValue("")
    expect(screen.getByRole("link", { name: /Frequently asked questions/i })).toHaveAttribute("href", "/faq")
    expect(screen.getByRole("link", { name: /Support guide/i })).toHaveAttribute("href", "/support")
  })

  it("reports required fields accessibly before sending a guest request", () => {
    render(<ContactPage />)

    fireEvent.submit(screen.getByRole("form", { name: "Contact form" }))

    expect(submitContact).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent("Please correct the highlighted fields.")
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Message")).toHaveAttribute("aria-invalid", "true")
  })

  it("reports an invalid email without calling the API", () => {
    render(<ContactPage />)
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Student Name" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } })
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Need help" } })

    fireEvent.submit(screen.getByRole("form", { name: "Contact form" }))

    expect(submitContact).not.toHaveBeenCalled()
    expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-describedby", "email-error")
  })

  it("keeps a logical keyboard order through the guest form controls", async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    const name = screen.getByLabelText("Name")
    const email = screen.getByLabelText("Email")
    const message = screen.getByLabelText("Message")
    const submit = screen.getByRole("button", { name: "Send message" })

    name.focus()
    await user.tab()
    expect(email).toHaveFocus()
    await user.tab()
    expect(message).toHaveFocus()
    await user.tab()
    expect(submit).toHaveFocus()
  })

  it("prefills and explains read-only identity for authenticated users", () => {
    setAuthenticatedUser()
    render(<ContactPage />)

    expect(screen.getByText("Signed in as Student Name")).toBeInTheDocument()
    expect(screen.getByText("Name and email are filled from your account.")).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("Student Name")
    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    expect(screen.getByLabelText("Name")).toHaveAttribute("readonly")
    expect(screen.getByLabelText("Email")).toHaveAttribute("readonly")
  })

  it("submits the exact guest payload and gives a consistent success state", async () => {
    vi.mocked(submitContact).mockResolvedValueOnce({ message: "Contact message submitted successfully." })
    render(<ContactPage />)
    fillGuestForm()

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => {
      expect(submitContact).toHaveBeenCalledWith({
        name: "Student Name",
        email: "student@example.com",
        message: "I need help with the platform.",
      })
    })

    expect(screen.getByRole("status")).toHaveTextContent("Contact message submitted successfully.")
    expect(screen.getByLabelText("Name")).toHaveValue("")
    expect(screen.getByLabelText("Email")).toHaveValue("")
    expect(screen.getByLabelText("Message")).toHaveValue("")
  })

  it("retains authenticated identity after a successful submission", async () => {
    setAuthenticatedUser()
    vi.mocked(submitContact).mockResolvedValueOnce({ message: "Contact message submitted successfully." })
    render(<ContactPage />)
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I need help." } })

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument())
    expect(screen.getByLabelText("Name")).toHaveValue("Student Name")
    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    expect(screen.getByLabelText("Message")).toHaveValue("")
  })

  it("disables the action and exposes the loading label while submitting", async () => {
    let resolveSubmit: ((value: { message: string }) => void) | undefined
    vi.mocked(submitContact).mockImplementationOnce(
      () => new Promise((resolve) => { resolveSubmit = resolve })
    )
    render(<ContactPage />)
    fillGuestForm()

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled()
    resolveSubmit?.({ message: "Contact message submitted successfully." })
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument())
  })

  it("shows backend validation errors and preserves every form value", async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(new Error("Name is required"))
    render(<ContactPage />)
    fillGuestForm()

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Name is required"))
    expect(screen.getByLabelText("Name")).toHaveValue("Student Name")
    expect(screen.getByLabelText("Email")).toHaveValue("student@example.com")
    expect(screen.getByLabelText("Message")).toHaveValue("I need help with the platform.")
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "name-error")
  })

  it("shows the rate-limit error without clearing the form", async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(new Error("Too many requests. Please try again later."))
    render(<ContactPage />)
    fillGuestForm()

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Too many requests. Please try again later.")
    })
    expect(screen.getByLabelText("Message")).toHaveValue("I need help with the platform.")
  })
})
