import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HowItWorksPage from "./page"

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
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}))

describe("how it works final UI", () => {
  it("renders the static beta journey and its CTA destinations", () => {
    render(<HowItWorksPage />)

    expect(screen.getByRole("heading", { level: 1, name: "How SSC practice works on Shikkha Buddy" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "From topic to revision" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What happens during an MCQ session" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What is available now" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "After practice" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Try the flow in a free MCQ session" })).toBeInTheDocument()

    expect(screen.getAllByRole("link", { name: "Start free" })[0]).toHaveAttribute("href", "/signup")
    expect(screen.getByRole("link", { name: "Choose a subject" })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: "Board-only sets, Pro option, opens pricing" })).toHaveAttribute("href", "/pricing")
  })

  it("renders the approved static availability and accessible MCQ example", () => {
    render(<HowItWorksPage />)

    expect(screen.getAllByText("Coming soon")).toHaveLength(2)
    expect(screen.getByText("Correct. Review: Refraction")).toBeInTheDocument()
    expect(screen.getByRole("table", { name: /current shikkha buddy practice availability/i })).toBeInTheDocument()
    expect(screen.queryByText("Higher Math")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument()
  })
})
