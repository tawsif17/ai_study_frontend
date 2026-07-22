import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import { UpgradeToProButton } from "./upgrade-to-pro-button"
import { upgradeToPro } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"
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

const verifiedFreeUser = {
  id: "u1",
  email: "student@example.com",
  full_name: "Student",
  role: "student",
  plan_tier: "free" as const,
  school: null,
  city: null,
  student_class: null,
  email_verified_at: "2026-07-13T00:00:00.000Z",
  last_login_at: null,
  created_at: "",
  updated_at: "",
}

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    authStatus: "authenticated",
    authError: null,
    user: verifiedFreeUser,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(verifiedFreeUser),
    retryAuth: vi.fn().mockResolvedValue(verifiedFreeUser),
    ...overrides,
  })
}

describe("Beta Pro activation button", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    mockGet.mockImplementation((key: string) => (key === "next" ? "/subjects/5" : null))
  })

  it("preserves the requested destination when a signed-out user activates Beta Pro", () => {
    mockAuth({ isAuthenticated: false, user: null })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpricing%3Fnext%3D%252Fsubjects%252F5")
    expect(screen.getByText("No trial, subscription, renewal or automatic billing.")).toBeInTheDocument()
  })

  it("keeps the CTA disabled while authentication state is loading", () => {
    mockAuth({ isLoading: true, user: null })

    render(<UpgradeToProButton />)

    expect(screen.getByRole("button", { name: "Loading beta access..." })).toBeDisabled()
    expect(screen.getByRole("status")).toHaveTextContent("Checking your beta access.")
  })

  it("sends unverified signed-in users to resend verification", () => {
    mockAuth({ user: { ...verifiedFreeUser, email_verified_at: null } })

    render(<UpgradeToProButton />)

    expect(screen.getByRole("link", { name: "Verify your email" })).toHaveAttribute(
      "href",
      "/resend-verification?email=student%40example.com"
    )
    expect(screen.getByText("Verify your email before activating Beta Pro.")).toBeInTheDocument()
  })

  it("continues to the requested route when Beta Pro is already active", () => {
    mockAuth({ user: { ...verifiedFreeUser, plan_tier: "pro" } })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Continue with Beta Pro" }))

    expect(mockPush).toHaveBeenCalledWith("/subjects/5")
    expect(upgradeToPro).not.toHaveBeenCalled()
  })

  it("activates verified free users and shows a pending state", async () => {
    let resolveUpgrade: ((value: { message: string; plan_tier: "pro" }) => void) | undefined
    vi.mocked(upgradeToPro).mockImplementationOnce(() => new Promise((resolve) => { resolveUpgrade = resolve }))
    const refreshUser = vi.fn().mockResolvedValue({ ...verifiedFreeUser, plan_tier: "pro" as const })
    mockAuth({ refreshUser })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(screen.getByRole("button", { name: "Activating Beta Pro..." })).toBeDisabled()
    resolveUpgrade?.({ message: "Activation complete", plan_tier: "pro" })

    await waitFor(() => {
      expect(refreshUser).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem("beta-pro-activation-confirmed")).toBe("/subjects/5")
      expect(mockPush).toHaveBeenCalledWith("/pricing/success?next=%2Fsubjects%2F5")
    })
  })

  it("announces an activation error", async () => {
    vi.mocked(upgradeToPro).mockRejectedValueOnce(
      new ApiClientError({ message: "Activation failed" }, 400)
    )
    mockAuth()

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Activation failed")
  })

  it("does not claim activation when the refreshed account is not Beta Pro", async () => {
    vi.mocked(upgradeToPro).mockResolvedValueOnce({ message: "Activation complete", plan_tier: "pro" })
    mockAuth({ refreshUser: vi.fn().mockResolvedValue(verifiedFreeUser) })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not confirm Beta Pro")
    expect(mockPush).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("beta-pro-activation-confirmed")).toBeNull()
  })

  it("does not claim activation when account refresh is temporarily unavailable", async () => {
    vi.mocked(upgradeToPro).mockResolvedValueOnce({ message: "Activation complete", plan_tier: "pro" })
    mockAuth({ refreshUser: vi.fn().mockResolvedValue(null) })

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not refresh your account")
    expect(mockPush).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("beta-pro-activation-confirmed")).toBeNull()
  })

  it("recovers a 401 response by returning to login with the preserved destination", async () => {
    vi.mocked(upgradeToPro).mockRejectedValueOnce(new ApiClientError({ message: "Session expired" }, 401))
    mockAuth()

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fpricing%3Fnext%3D%252Fsubjects%252F5")
    })
  })

  it("shows an unavailable state for unavailable activation service responses", async () => {
    vi.mocked(upgradeToPro).mockRejectedValueOnce(new ApiClientError({ message: "Unavailable" }, 503))
    mockAuth()

    render(<UpgradeToProButton />)
    fireEvent.click(screen.getByRole("button", { name: "Activate Beta Pro" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Beta Pro activation is unavailable right now")
    expect(screen.getByRole("button", { name: "Activate Beta Pro" })).toBeDisabled()
  })

  it("has no detectable accessibility violations for the verification action", async () => {
    mockAuth({ user: { ...verifiedFreeUser, email_verified_at: null } })
    const { container } = render(<UpgradeToProButton />)
    expect((await axe(container, { rules: { region: { enabled: false } } })).violations).toEqual([])
  })
})
