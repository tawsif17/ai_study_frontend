import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NotFoundPage from "@/app/not-found"
import sitemap from "@/app/sitemap"
import { Footer } from "@/components/footer"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/components/brand-logo", () => ({
  BrandLogo: () => <span aria-hidden="true">Shikkha Buddy</span>,
}))

describe("global not-found page", () => {
  it("renders the branded recovery message and reassurance", () => {
    render(<NotFoundPage />)

    expect(screen.getByText("Page not found")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "This page took a wrong turn." })).toBeInTheDocument()
    expect(screen.getByText("The page you're looking for may have moved or no longer exists.")).toBeInTheDocument()
    expect(screen.getByText("Your progress and account are safe.")).toBeInTheDocument()
  })

  it("links every recovery action to a real public route", () => {
    render(<NotFoundPage />)

    expect(screen.getByRole("link", { name: "Choose a subject" })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: "Go to homepage" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: /Practice/ })).toHaveAttribute("href", "/subjects")
    expect(screen.getByRole("link", { name: /How it works/ })).toHaveAttribute("href", "/how-it-works")
    expect(screen.getByRole("link", { name: /Contact support/ })).toHaveAttribute("href", "/contact")
  })

  it("keeps the Refund Policy out of the public footer and sitemap", () => {
    const { unmount } = render(<Footer />)

    expect(screen.queryByRole("link", { name: "Refund Policy" })).not.toBeInTheDocument()
    unmount()

    const sitemapPaths = sitemap().map((entry) => new URL(entry.url).pathname)
    expect(sitemapPaths).not.toContain("/refund-policy")
  })
})
