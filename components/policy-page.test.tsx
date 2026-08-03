import { render, screen } from "@testing-library/react"
import { Cookie, ShieldCheck } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { PolicyPage } from "./policy-page"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

describe("PolicyPage", () => {
  it("renders a dated policy, in-page navigation, policy detail, and available support links", () => {
    render(
      <PolicyPage
        title="Cookie Policy"
        updatedAt="July 16, 2026"
        description="How essential browser storage is used."
        summary={[
          { title: "Essential use only", description: "For sign-in and preferences.", icon: Cookie, iconClassName: "text-primary" },
          { title: "No ad cookies", description: "No advertising cookies during beta.", icon: ShieldCheck, iconClassName: "text-emerald-700" },
        ]}
        sections={[
          { id: "introduction", title: "Introduction", paragraphs: ["Policy introduction."] },
          { id: "controls", title: "Browser controls", items: ["Clear local browser storage."] },
        ]}
        ctaTitle="Need help?"
        ctaDescription="Use Contact for policy questions."
        secondaryLink={{ href: "/privacy", label: "Privacy Policy" }}
      />,
    )

    expect(screen.getByRole("heading", { level: 1, name: "Cookie Policy" })).toBeInTheDocument()
    expect(screen.getByText("Last updated: July 16, 2026")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Cookie Policy sections" })).toBeInTheDocument()
    const introductionLink = screen.getByRole("link", { name: "1. Introduction" })
    expect(introductionLink).toHaveAttribute("href", "#introduction")
    expect(introductionLink).toHaveClass("min-h-11")
    expect(screen.getByText("Clear local browser storage.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy")
  })
})
