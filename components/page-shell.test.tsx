import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PageShell } from "./page-shell"

vi.mock("./navbar", () => ({ Navbar: () => <nav>Navigation</nav> }))
vi.mock("./footer", () => ({ Footer: () => <footer>Footer</footer> }))

describe("PageShell", () => {
  it("provides a keyboard skip link and stable main target", () => {
    render(<PageShell>Page content</PageShell>)

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content")
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1")
  })
})
