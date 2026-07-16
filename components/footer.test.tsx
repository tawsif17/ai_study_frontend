import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Footer } from "./footer"

vi.mock("@/components/brand-logo", () => ({
  BrandLogo: () => <span>Shikkha Buddy</span>,
}))

describe("Footer", () => {
  it("keeps the approved Company and Trust & Legal links without obsolete or social links", () => {
    render(<Footer />)

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about")
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact")
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support")
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq")
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy")
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms")
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute("href", "/cookies")
    expect(screen.getByText("© 2026 Shikkha Buddy. All rights reserved.")).toBeInTheDocument()
    expect(screen.queryByText("Data Protection")).not.toBeInTheDocument()
    expect(screen.queryByText("AI Disclaimer")).not.toBeInTheDocument()
    expect(screen.queryByText("Data Deletion")).not.toBeInTheDocument()
    expect(screen.queryByText(/Refund Policy/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /facebook|instagram|linkedin|twitter|youtube|tiktok/i })).not.toBeInTheDocument()
  })
})
