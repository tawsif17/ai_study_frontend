import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import FAQPage from "./page"

vi.mock("next/navigation", () => ({
  usePathname: () => "/faq",
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

describe("FAQ page", () => {
  it("renders the approved beta copy and valid destinations", async () => {
    const user = userEvent.setup()
    render(<FAQPage />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Questions about practising with Shikkha Buddy?" }),
    ).toBeInTheDocument()
    expect(screen.getByText("General Math, Physics, and Chemistry are available during the beta.")).toBeInTheDocument()
    expect(screen.queryByText(/Higher Math/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Refund Policy/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "How is my data used?" }))
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy")

    await user.click(screen.getByRole("button", { name: "How do I contact support?" }))
    expect(screen.getByRole("link", { name: "Contact page" })).toHaveAttribute("href", "/contact")
    expect(screen.getAllByRole("link", { name: "Contact support" })[0]).toHaveAttribute("href", "/contact")
    expect(screen.getAllByRole("link", { name: "Start free" }).some((link) => link.getAttribute("href") === "/signup")).toBe(true)
  }, 10_000)

  it("starts with the first question expanded and expands another question accessibly", async () => {
    const user = userEvent.setup()
    render(<FAQPage />)

    const subjectsTrigger = screen.getByRole("button", { name: "Which subjects are available during the beta?" })
    const practiceTrigger = screen.getByRole("button", { name: "What can I practise right now?" })

    expect(subjectsTrigger).toHaveAttribute("aria-expanded", "true")
    expect(practiceTrigger).toHaveAttribute("aria-expanded", "false")

    await user.click(practiceTrigger)

    expect(practiceTrigger).toHaveAttribute("aria-expanded", "true")
    expect(subjectsTrigger).toHaveAttribute("aria-expanded", "false")
    expect(
      screen.getByText("MCQ practice is available during the beta. CQ and Mixed Practice are coming soon and are not currently selectable."),
    ).toBeVisible()
  })

  it("supports Enter, Space, Tab, and Shift+Tab keyboard interaction", async () => {
    const user = userEvent.setup()
    render(<FAQPage />)

    const triggers = screen.getAllByRole("button", {
      name: /Which subjects|What can I practise|What is Beta Pro|Is payment required|How does Board-only|Can AI-generated|How is my data|How do I contact support/,
    })

    for (const trigger of triggers) {
      if (trigger.getAttribute("aria-expanded") === "true") {
        await user.click(trigger)
      }

      trigger.focus()
      await user.keyboard("{Enter}")
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      expect(trigger).toHaveFocus()

      await user.keyboard("{Enter}")
      expect(trigger).toHaveAttribute("aria-expanded", "false")

      await user.keyboard(" ")
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      expect(trigger).toHaveFocus()

      await user.keyboard(" ")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
    }

    triggers[0].focus()
    await user.tab()
    expect(triggers[1]).toHaveFocus()
    await user.tab({ shift: true })
    expect(triggers[0]).toHaveFocus()
  }, 10_000)

  it("uses the approved conservative Beta Pro and AI wording", async () => {
    const user = userEvent.setup()
    render(<FAQPage />)

    await user.click(screen.getByRole("button", { name: "Is payment required during the beta?" }))
    expect(
      screen.getByText(
        "No. Activating Beta Pro during the beta does not require payment and does not start a trial, renewal, or automatic billing.",
      ),
    ).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Can AI-generated content contain mistakes?" }))
    expect(screen.getByText(/AI-generated questions, feedback, and explanations may contain mistakes/)).toBeVisible()
    expect(screen.queryByText(/guaranteed|always accurate|improve your grades/i)).not.toBeInTheDocument()
  })
})
