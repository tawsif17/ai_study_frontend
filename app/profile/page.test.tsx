import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type React from "react"
import ProfilePage from "./page"
import { useAuth } from "@/lib/auth-context"

const router = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/profile",
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

const user = {
  id: "user-1",
  email: "nadia@example.com",
  full_name: "Nadia Rahman",
  role: "user",
  plan_tier: "free" as const,
  school: "Sample Model School",
  city: "Dhaka",
  student_class: 10,
  email_verified_at: "2026-07-01T00:00:00.000Z",
  last_login_at: "2026-07-16T00:00:00.000Z",
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
}

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    ...overrides,
  })
}

describe("profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth()
  })

  it("renders contract-backed profile details and the approved next steps", () => {
    render(<ProfilePage />)

    expect(screen.getByRole("heading", { level: 1, name: "Welcome back, Nadia" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Nadia Rahman" })).toBeInTheDocument()
    expect(screen.getByText("Free access")).toBeInTheDocument()
    expect(screen.getByText("nadia@example.com")).toBeInTheDocument()
    expect(screen.getByText("Sample Model School")).toBeInTheDocument()
    expect(screen.getByText("Class 10")).toBeInTheDocument()
    expect(screen.getByText("Dhaka")).toBeInTheDocument()
    expect(screen.getByText("Email verified")).toBeInTheDocument()

    expect(screen.getByRole("link", { name: "Choose a subject: Start MCQ practice" })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: "View weak areas: Review weak areas" })).toHaveAttribute("href", "/dashboard/weak-areas")
    expect(screen.getByRole("link", { name: "View bookmarks: Review bookmarked questions" })).toHaveAttribute("href", "/bookmarks")
    expect(screen.queryByText("Understand your access")).not.toBeInTheDocument()
    expect(screen.queryByText("Sample profile data")).not.toBeInTheDocument()
  })

  it("renders nullable fields and unverified status truthfully", () => {
    mockAuth({ user: { ...user, plan_tier: "pro", school: null, city: null, student_class: null, email_verified_at: null } })
    render(<ProfilePage />)

    expect(screen.getByText("Beta Pro access")).toBeInTheDocument()
    expect(screen.getAllByText("Not provided")).toHaveLength(3)
    expect(screen.getByText("Email not verified")).toBeInTheDocument()
  })

  it("announces the loading state without exposing profile data", () => {
    mockAuth({ isLoading: true, user: null })
    render(<ProfilePage />)

    expect(screen.getByRole("status", { name: "Loading profile" })).toBeInTheDocument()
    expect(screen.queryByText("nadia@example.com")).not.toBeInTheDocument()
  })

  it("redirects unauthenticated visitors while preserving the intended destination", async () => {
    mockAuth({ isAuthenticated: false, user: null })
    render(<ProfilePage />)

    expect(screen.getByRole("status")).toHaveTextContent("Redirecting to login")
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login?next=%2Fprofile"))
  })

  it("offers a guarded refresh when authenticated profile data is unavailable", async () => {
    const refreshUser = vi.fn().mockResolvedValue(null)
    mockAuth({ user: null, refreshUser })
    render(<ProfilePage />)

    fireEvent.click(screen.getByRole("button", { name: "Refresh profile" }))

    expect(screen.getByRole("button", { name: "Refreshing…" })).toBeDisabled()
    await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole("alert")).toHaveTextContent("Please sign in again")
  })
})
