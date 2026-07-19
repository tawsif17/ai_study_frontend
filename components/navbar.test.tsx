import { fireEvent, render, screen, within } from "@testing-library/react"
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
    user: { full_name: "Nadia Rahman" },
    logout: navigationState.logout,
  }),
}))

describe("Navbar", () => {
  beforeEach(() => {
    navigationState.pathname = "/"
    navigationState.logout.mockClear()
  })

  it("keeps Home in the desktop navigation and moves account links into the profile menu", async () => {
    navigationState.pathname = "/profile"
    const user = userEvent.setup()
    render(<Navbar />)

    const home = screen.getByRole("link", { name: "Home" })

    expect(home).toHaveAttribute("href", "/")
    expect(home).not.toHaveAttribute("aria-current")

    await user.click(screen.getAllByRole("button", { name: "Open Nadia Rahman's account menu" })[0])

    const accountMenu = screen.getByRole("menu")
    expect(within(accountMenu).getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile")
    expect(within(accountMenu).getByRole("menuitem", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/weak-areas")
    expect(within(accountMenu).getByRole("menuitem", { name: "Bookmarks coming soon" })).toHaveAttribute("data-disabled", "")
  })

  it("keeps account access in the mobile avatar menu rather than the navigation list", async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }))

    const homeLinks = screen.getAllByRole("link", { name: "Home" })

    expect(homeLinks).toHaveLength(2)
    expect(homeLinks[1]).toHaveAttribute("href", "/")
    expect(homeLinks[1]).toHaveAttribute("aria-current", "page")
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument()

    const accountMenuButtons = screen.getAllByRole("button", { name: "Open Nadia Rahman's account menu" })
    expect(accountMenuButtons).toHaveLength(2)
    await user.click(accountMenuButtons[1])

    expect(within(screen.getByRole("menu")).getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile")
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

  it("logs out from the account menu", async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getAllByRole("button", { name: "Open Nadia Rahman's account menu" })[0])
    await user.click(within(screen.getByRole("menu")).getByRole("menuitem", { name: "Logout" }))

    expect(navigationState.logout).toHaveBeenCalledOnce()
  })
})
