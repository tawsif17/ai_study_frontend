import type React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import SignupPage from "./page"
import { useAuth } from "@/lib/auth-context"
import { ApiClientError, ApiNetworkError } from "@/lib/api/client"
import { useDistricts } from "@/lib/api/hooks"
import { BANGLADESH_DISTRICT_NAMES, type DistrictName } from "@/lib/api"

const mockPush = vi.fn()
const mockRegister = vi.fn()
const mockRetryDistricts = vi.fn()

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

vi.mock("@/lib/api/hooks", () => ({
  useDistricts: vi.fn(),
}))

vi.mock("./district-combobox", () => ({
  DistrictCombobox: ({
    id,
    value,
    districts,
    onValueChange,
    disabled,
    invalid,
    describedBy,
    open,
  }: {
    id: string
    value: DistrictName | ""
    districts: DistrictName[]
    onValueChange: (value: DistrictName) => void
    disabled?: boolean
    invalid?: boolean
    describedBy?: string
    open: boolean
  }) => (
    <select
      id={id}
      value={value}
      onChange={(event) => onValueChange(event.target.value as DistrictName)}
      disabled={disabled}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      data-open={open}
    >
      <option value="">Select a district</option>
      {districts.map((district) => (
        <option key={district} value={district}>{district}</option>
      ))}
    </select>
  ),
}))

function fillValidSignupForm() {
  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Student Name" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } })
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123" } })
  fireEvent.change(screen.getByLabelText("School Name"), {
    target: { value: "Example High School" },
  })
  fireEvent.change(screen.getByLabelText("District"), { target: { value: "Dhaka" } })
  fireEvent.change(screen.getByLabelText("Class"), { target: { value: "10" } })
}

describe("signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      authStatus: "unauthenticated",
      authError: null,
      user: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      retryAuth: vi.fn(),
    })
    vi.mocked(useDistricts).mockReturnValue({
      districts: [...BANGLADESH_DISTRICT_NAMES],
      isLoading: false,
      isValidating: false,
      isError: undefined,
      mutate: mockRetryDistricts,
    })
  })

  it("shows check-email guidance when an account is created below capacity", async () => {
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

  it("shows the waitlist confirmation in place when capacity is reached", async () => {
    mockRegister.mockResolvedValueOnce({
      data: {
        message:
          "We’ve reached our current 200-user capacity. Your waitlist request has been received, and we’ll contact you when access becomes available.",
      },
      status: 202,
    })

    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Request received")
    expect(
      screen.getByText(/We’ve reached our current 200-user capacity/)
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toHaveValue("")
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows API errors and re-enables submit", async () => {
    mockRegister.mockRejectedValueOnce(
      new ApiClientError({ message: "Email is already registered" }, 409)
    )

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
    expect(screen.getByLabelText("District")).toBeDisabled()
    expect(screen.getByLabelText("Class")).toBeDisabled()

    resolveRegister?.({
      data: { message: "Thank you for your interest!" },
      status: 202,
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Account" })).toBeEnabled()
    })
  })

  it("normalizes email and shows visible password requirements", async () => {
    mockRegister.mockResolvedValueOnce({
      data: { message: "Registration successful." },
      status: 201,
    })
    render(<SignupPage />)
    fillValidSignupForm()
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " Student@Example.COM " },
    })

    expect(screen.getByText(/Use at least 8 characters, including uppercase/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ email: "student@example.com" })
      )
    })
    expect(screen.getByText(/student@example.com/)).toBeInTheDocument()
  })

  it("offers resend recovery when signup delivery is uncertain", async () => {
    mockRegister.mockRejectedValueOnce(new ApiNetworkError())
    render(<SignupPage />)
    fillValidSignupForm()

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't confirm whether your verification email was sent"
    )
    expect(screen.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
      "href",
      "/resend-verification?email=student%40example.com"
    )
  })

  it("shows accessible field errors without calling registration", () => {
    render(<SignupPage />)
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Select your class.")).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it("keeps other fields editable while districts load and blocks submission", () => {
    vi.mocked(useDistricts).mockReturnValue({
      districts: undefined,
      isLoading: true,
      isValidating: true,
      isError: undefined,
      mutate: mockRetryDistricts,
    })

    render(<SignupPage />)

    expect(screen.getByText("Loading districts...")).toBeInTheDocument()
    expect(screen.getByLabelText("District")).toBeDisabled()
    expect(screen.getByLabelText("Full Name")).toBeEnabled()
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled()
  })

  it("retries district loading without discarding entered values", async () => {
    vi.mocked(useDistricts).mockReturnValue({
      districts: undefined,
      isLoading: false,
      isValidating: false,
      isError: new ApiNetworkError(),
      mutate: mockRetryDistricts,
    })
    mockRetryDistricts.mockResolvedValueOnce([...BANGLADESH_DISTRICT_NAMES])

    render(<SignupPage />)
    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Student Name" } })
    fireEvent.click(screen.getByRole("button", { name: "Retry districts" }))

    expect(mockRetryDistricts).toHaveBeenCalledOnce()
    expect(screen.getByLabelText("Full Name")).toHaveValue("Student Name")
  })

  it("clears and refreshes a district rejected as stale by registration", async () => {
    mockRegister.mockRejectedValueOnce(
      new ApiClientError({ message: "City must be a valid Bangladesh district" }, 400)
    )
    mockRetryDistricts.mockResolvedValueOnce([...BANGLADESH_DISTRICT_NAMES])

    render(<SignupPage />)
    fillValidSignupForm()
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(await screen.findByText("City must be a valid Bangladesh district")).toBeInTheDocument()
    expect(screen.getByLabelText("District")).toHaveValue("")
    expect(screen.getByLabelText("District")).toHaveAttribute("data-open", "true")
    expect(mockRetryDistricts).toHaveBeenCalledOnce()
  })

  it("does not reopen stale district options when refreshing them fails", async () => {
    mockRegister.mockRejectedValueOnce(
      new ApiClientError({ message: "City must be a valid Bangladesh district" }, 400)
    )
    mockRetryDistricts.mockRejectedValueOnce(new ApiNetworkError())

    render(<SignupPage />)
    fillValidSignupForm()
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    expect(await screen.findByText("City must be a valid Bangladesh district")).toBeInTheDocument()
    expect(screen.getByLabelText("District")).toHaveAttribute("data-open", "false")
  })

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<SignupPage />)
    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
