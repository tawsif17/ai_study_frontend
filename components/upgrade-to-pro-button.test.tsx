import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UpgradeToProButton } from "./upgrade-to-pro-button"
import { upgradeToPro } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()
const mockGet = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock("@/lib/api", () => ({
  upgradeToPro: vi.fn(),
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

describe("upgrade to pro button", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockImplementation((key: string) => (key === "next" ? "/subjects/5" : null))
  })

  it("redirects unauthenticated users to login", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }))

    expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpricing%3Fnext%3D%252Fsubjects%252F5")
  })

  it("calls upgrade endpoint and redirects to next route for free users", async () => {
    const refreshUser = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "u1",
        email: "student@example.com",
        full_name: "Student",
        role: "student",
        plan_tier: "free",
        school: null,
        city: null,
        student_class: null,
        email_verified_at: null,
        last_login_at: null,
        created_at: "",
        updated_at: "",
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser,
    })
    vi.mocked(upgradeToPro).mockResolvedValueOnce({
      message: "Upgrade successful. Pro trial is now active.",
      plan_tier: "pro",
    })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }))

    await waitFor(() => {
      expect(upgradeToPro).toHaveBeenCalledTimes(1)
      expect(refreshUser).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith("/pricing/success?next=%2Fsubjects%2F5")
    })
  })

  it("shows API error message when upgrade fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "u1",
        email: "student@example.com",
        full_name: "Student",
        role: "student",
        plan_tier: "free",
        school: null,
        city: null,
        student_class: null,
        email_verified_at: null,
        last_login_at: null,
        created_at: "",
        updated_at: "",
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn().mockResolvedValue(undefined),
    })
    vi.mocked(upgradeToPro).mockRejectedValueOnce(new Error("Upgrade failed"))

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }))

    await waitFor(() => {
      expect(screen.getByText("Upgrade failed")).toBeInTheDocument()
    })
  })
})
