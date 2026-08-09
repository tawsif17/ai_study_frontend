import type React from "react"
import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PricingContent } from "./pricing-content"
import { useAuth } from "@/lib/auth-context"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/components/upgrade-to-pro-button", () => ({
  UpgradeToProButton: () => <button type="button">Activate Beta Pro</button>,
}))

vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))

function mockAuth(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    isLoading: false,
    authStatus: isAuthenticated ? "authenticated" : "unauthenticated",
    authError: null,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    retryAuth: vi.fn(),
  })
}

describe("PricingContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth(false)
  })

  it("shows the approved Beta Pro feature information", () => {
    render(<PricingContent />)

    expect(screen.getAllByText("Mathematics, Physics & Chemistry")).toHaveLength(1)
    expect(screen.getByText("Start free. Activate Beta Pro when revision needs more focus.")).toBeInTheDocument()
    expect(screen.getAllByText("Board-only MCQ sets")).toHaveLength(2)
    expect(screen.getAllByText("Weak Area Analysis")).toHaveLength(2)
    expect(screen.getAllByText("CQ & Mixed Practice")).toHaveLength(1)
    expect(screen.getAllByText("Available now").length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText("Coming soon")).toHaveLength(2)
    expect(screen.getAllByText("Beta Pro").length).toBeGreaterThanOrEqual(5)

    expect(within(screen.getByRole("row", { name: /^Explanations/i })).getByLabelText("Not included")).toBeInTheDocument()
    expect(within(screen.getByRole("row", { name: /Bookmarks and Mistakes revision/i })).getByLabelText("Not included")).toBeInTheDocument()
  })

  it("does not make paid-plan or billing claims", () => {
    render(<PricingContent />)

    expect(screen.queryByText(/Tk 499/i)).not.toBeInTheDocument()
    expect(screen.getAllByText("No payment during beta").length).toBeGreaterThanOrEqual(2)
  })

  it("shows Practice instead of Start free after login", () => {
    mockAuth(true)
    render(<PricingContent />)

    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute("href", "/subjects")
    expect(screen.queryByRole("link", { name: "Start free" })).not.toBeInTheDocument()
  })
})
