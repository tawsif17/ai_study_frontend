import type React from "react"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PricingContent } from "./pricing-content"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/components/upgrade-to-pro-button", () => ({
  UpgradeToProButton: () => <button type="button">Activate Beta Pro</button>,
}))

describe("PricingContent", () => {
  it("shows the approved Beta Pro feature information", () => {
    render(<PricingContent />)

    expect(screen.getAllByText("General Math, Physics & Chemistry")).toHaveLength(2)
    expect(screen.getByText("Start free. Activate Beta Pro when revision needs more focus.")).toBeInTheDocument()
    expect(screen.getAllByText("Board-only MCQ sets")).toHaveLength(2)
    expect(screen.getAllByText("Weak Area Analysis")).toHaveLength(2)
    expect(screen.getAllByText("CQ & Mixed Practice")).toHaveLength(1)
    expect(screen.getAllByText("Available now").length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByText("Coming soon")).toHaveLength(2)

    expect(within(screen.getByRole("row", { name: /Weak Area Analysis/i })).getByLabelText("Not included")).toBeInTheDocument()
    expect(within(screen.getByRole("row", { name: /Board-only MCQ sets/i })).getByLabelText("Not included")).toBeInTheDocument()
  })

  it("does not make paid-plan or billing claims", () => {
    render(<PricingContent />)

    expect(screen.queryByText(/Tk 499/i)).not.toBeInTheDocument()
    expect(screen.getAllByText("No payment during beta").length).toBeGreaterThanOrEqual(2)
  })
})
