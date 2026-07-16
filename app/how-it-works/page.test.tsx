import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import HowItWorksPage from "./page"
import { useAuth } from "@/lib/auth-context"

vi.mock("next/navigation", () => ({
  usePathname: () => "/how-it-works",
}))

vi.mock("@/components/brand-logo", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  return {
    BrandLogo: ({ className }: { className?: string }) =>
      React.createElement("span", { className }, "Shikkha Buddy"),
  }
})

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

function mockAuth(isAuthenticated: boolean, isLoading = false) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    isLoading,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  })
}

describe("how it works final UI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth(false)
  })

  it("renders the static beta journey and its CTA destinations", () => {
    render(<HowItWorksPage />)

    expect(screen.getByRole("heading", { level: 1, name: "How SSC practice works on Shikkha Buddy" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "From topic to revision" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What happens during an MCQ session" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What is available now" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "After practice" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Try the flow in a free MCQ session" })).toBeInTheDocument()

    const page = within(screen.getByRole("main"))
    expect(page.getAllByRole("link", { name: "Start free" })).toHaveLength(1)
    page.getAllByRole("link", { name: "Start free" }).forEach((link) => {
      expect(link).toHaveAttribute("href", "/login?next=%2Fsubjects")
    })
    expect(screen.getByRole("link", { name: "Choose a subject" })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: "Board-only MCQ sets, Pro option, opens pricing" })).toHaveAttribute("href", "/pricing")
    expect(screen.getByRole("link", { name: "Weak Area Analysis, Pro option, opens pricing" })).toHaveAttribute("href", "/pricing")
  })

  it("sends authenticated users from the Start free CTA to subjects", () => {
    mockAuth(true)
    render(<HowItWorksPage />)

    const startFreeLinks = within(screen.getByRole("main")).getAllByRole("link", { name: "Start free" })
    expect(startFreeLinks).toHaveLength(1)
    startFreeLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/subjects")
    })
  })

  it("prevents navigation until authentication has finished loading", () => {
    mockAuth(false, true)
    render(<HowItWorksPage />)

    const page = within(screen.getByRole("main"))
    expect(page.queryByRole("link", { name: "Start free" })).not.toBeInTheDocument()
    const loadingActions = page.getAllByRole("button", { name: "Start free" })
    expect(loadingActions).toHaveLength(1)
    loadingActions.forEach((button) => {
      expect(button).toBeDisabled()
    })
    expect(page.getByRole("link", { name: "Choose a subject" })).toHaveAttribute("href", "/subjects")
  })

  it("renders the approved static availability and accessible MCQ example", () => {
    render(<HowItWorksPage />)

    expect(screen.getAllByText("Coming soon")).toHaveLength(2)
    expect(screen.getByText("Weak Area Analysis")).toBeInTheDocument()
    expect(screen.getByText("Identifying chapters that need more practice")).toBeInTheDocument()
    expect(screen.getByText("Correct. Review: Refraction")).toBeInTheDocument()
    expect(screen.getByRole("table", { name: /current shikkha buddy practice availability/i })).toBeInTheDocument()
    expect(screen.queryByText("Higher Math")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument()
  })
})
