import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import SupportPage from "./page"

vi.mock("@/components/trust-page", () => ({
  TrustPage: ({ sections }: { sections: Array<{ title: string; body?: string; items?: string[] }> }) => (
    <main>
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <h2>{section.title}</h2>
          {section.body && <p>{section.body}</p>}
          {section.items?.map((item) => <p key={item}>{item}</p>)}
        </section>
      ))}
    </main>
  ),
}))

describe("Support page", () => {
  it("keeps current support topics and excludes the removed data-deletion topic", () => {
    render(<SupportPage />)

    expect(screen.getByText("Account signup, login, or email verification issues.")).toBeInTheDocument()
    expect(screen.queryByText(/account or data deletion/i)).not.toBeInTheDocument()
  })
})
