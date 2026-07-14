import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UpgradeSuccessContent } from "./upgrade-success-content"
import { useAuth } from "@/lib/auth-context"

const mockGet = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

const activeUser = {
  id: "u1",
  email: "student@example.com",
  full_name: "Student",
  role: "student",
  plan_tier: "pro" as const,
  school: null,
  city: null,
  student_class: null,
  email_verified_at: "2026-07-13T00:00:00.000Z",
  last_login_at: null,
  created_at: "",
  updated_at: "",
}

describe("upgrade success content", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: activeUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn().mockResolvedValue(activeUser),
    })
  })

  it("shows a confirmed activation only after the activation flow set the session marker", async () => {
    mockGet.mockImplementation((key: string) => (key === "next" ? "/subjects/9" : null))
    sessionStorage.setItem("beta-pro-activation-confirmed", "/subjects/9")
    render(<UpgradeSuccessContent />)

    expect(await screen.findByRole("heading", { name: "Beta Pro activated" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/subjects/9")
    expect(screen.getByRole("link", { name: "Go to subjects" })).toHaveAttribute("href", "/subjects")
    expect(sessionStorage.getItem("beta-pro-activation-confirmed")).toBeNull()
  })

  it("returns direct success-page visits to Pricing instead of claiming activation", async () => {
    mockGet.mockImplementation((key: string) => (key === "next" ? "https://example.com" : null))
    render(<UpgradeSuccessContent />)

    expect(screen.getByRole("status")).toHaveTextContent("Checking Beta Pro access...")
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/pricing?next=%2Fsubjects")
    })
    expect(screen.queryByRole("heading", { name: "Beta Pro activated" })).not.toBeInTheDocument()
  })

  it("returns to Pricing when the session marker exists but the account is not Beta Pro", async () => {
    mockGet.mockImplementation((key: string) => (key === "next" ? "/subjects/9" : null))
    sessionStorage.setItem("beta-pro-activation-confirmed", "/subjects/9")
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...activeUser, plan_tier: "free" },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn().mockResolvedValue(null),
    })

    render(<UpgradeSuccessContent />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/pricing?next=%2Fsubjects%2F9")
    })
    expect(screen.queryByRole("heading", { name: "Beta Pro activated" })).not.toBeInTheDocument()
  })
})
