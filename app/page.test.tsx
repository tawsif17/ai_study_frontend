import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomePage from "./page"

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

describe("homepage final UI", () => {
  it("renders the approved homepage sections and navigation targets", () => {
    render(<HomePage />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Practice smarter for SSC exams" })
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "MCQ practice preview" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Start practicing" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Practice by subject" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Start your first SSC practice session today" })).toBeInTheDocument()

    const practiceLinks = screen.getAllByRole("link", { name: "Practice" })
    expect(practiceLinks.some((link) => link.getAttribute("href") === "/subjects")).toBe(true)
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login")
    expect(screen.getAllByRole("link", { name: "Start free" })[0]).toHaveAttribute("href", "/signup")

    expect(screen.getByRole("link", { name: "Start free practice" })).toHaveAttribute(
      "href",
      "/login?next=%2Fsubjects"
    )
    expect(screen.getByRole("link", { name: "Continue practicing" })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: "Board-only MCQ sets, Pro option, opens pricing" })).toHaveAttribute(
      "href",
      "/pricing"
    )

    const subjectStartLinks = screen.getAllByRole("link", { name: "Start Practice" })
    expect(subjectStartLinks).toHaveLength(3)
    expect(subjectStartLinks[0]).toHaveAttribute("href", "/login?next=%2Fsubjects%3Fsubject%3Dgeneral-math")
    expect(subjectStartLinks[1]).toHaveAttribute("href", "/login?next=%2Fsubjects%3Fsubject%3Dphysics")
    expect(subjectStartLinks[2]).toHaveAttribute("href", "/login?next=%2Fsubjects%3Fsubject%3Dchemistry")
  })

  it("renders static availability, disabled future modes, subjects, and hidden social links", () => {
    render(<HomePage />)

    expect(screen.getByText("Correct. Review: Refraction")).toBeInTheDocument()
    expect(screen.getAllByText(/Activate Beta Pro later for Board-only MCQ sets and Weak Area Analysis/)).toHaveLength(2)

    expect(screen.getByText("CQ Practice")).toBeInTheDocument()
    expect(screen.getByText("Mixed Practice")).toBeInTheDocument()
    expect(screen.getAllByText("Coming soon")).toHaveLength(2)

    expect(screen.getByRole("heading", { name: "General Math" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Chemistry" })).toBeInTheDocument()
    expect(screen.queryByText("Higher Math")).not.toBeInTheDocument()

    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /instagram/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /youtube/i })).not.toBeInTheDocument()
  })
})
