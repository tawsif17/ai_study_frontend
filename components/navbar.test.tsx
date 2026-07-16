import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Navbar } from "./navbar"

const navigationState = vi.hoisted(() => ({
  pathname: "/",
  logout: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}))

vi.mock("@/components/brand-logo", () => ({
  BrandLogo: () => <span>Shikkha Buddy</span>,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    logout: navigationState.logout,
  }),
}))

describe("Navbar", () => {
  beforeEach(() => {
    navigationState.pathname = "/"
    navigationState.logout.mockClear()
  })

  it("adds Home and Profile to the desktop navigation with supported destinations", () => {
    navigationState.pathname = "/profile"
    render(<Navbar />)

    const home = screen.getByRole("link", { name: "Home" })
    const profile = screen.getByRole("link", { name: "Profile" })

    expect(home).toHaveAttribute("href", "/")
    expect(home).not.toHaveAttribute("aria-current")
    expect(profile).toHaveAttribute("href", "/profile")
    expect(profile).toHaveAttribute("aria-current", "page")
  })

  it("keeps Home and Profile available in the mobile navigation with active-state semantics", () => {
    render(<Navbar />)

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }))

    const homeLinks = screen.getAllByRole("link", { name: "Home" })
    const profileLinks = screen.getAllByRole("link", { name: "Profile" })

    expect(homeLinks).toHaveLength(2)
    expect(homeLinks[1]).toHaveAttribute("href", "/")
    expect(homeLinks[1]).toHaveAttribute("aria-current", "page")
    expect(profileLinks).toHaveLength(2)
    expect(profileLinks[1]).toHaveAttribute("href", "/profile")
  })

  it("moves keyboard focus into the opened mobile navigation", async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const menuButton = screen.getByRole("button", { name: "Open navigation menu" })
    await user.click(menuButton)
    menuButton.focus()
    await user.tab()

    expect(screen.getAllByRole("link", { name: "Home" })[1]).toHaveFocus()
  })
})
