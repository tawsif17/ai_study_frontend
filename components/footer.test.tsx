import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Footer } from "./footer"

vi.mock("@/components/brand-logo", () => ({
  BrandLogo: () => <span>Shikkha Buddy</span>,
}))

describe("Footer", () => {
  it("keeps only working beta legal links and removes obsolete policy links", () => {
    render(<Footer />)

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy")
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
    expect(screen.queryByText("Data Protection")).not.toBeInTheDocument()
    expect(screen.queryByText("AI Disclaimer")).not.toBeInTheDocument()
    expect(screen.queryByText("Data Deletion")).not.toBeInTheDocument()
    expect(screen.queryByText(/Refund Policy/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cookie Policy/i)).not.toBeInTheDocument()
  })
})
