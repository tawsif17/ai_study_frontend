import { render, screen } from "@testing-library/react"
import { axe } from "vitest-axe"
import { describe, expect, it, vi } from "vitest"
import { SessionRecoveryBanner } from "./session-recovery-banner"

describe("SessionRecoveryBanner", () => {
  it("is hidden outside the retryable refresh state", () => {
    const { container } = render(
      <SessionRecoveryBanner authStatus="authenticated" authError={null} onRetry={vi.fn()} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("provides an accessible recovery action without exposing internal details", async () => {
    const { container } = render(
      <SessionRecoveryBanner
        authStatus="retryable-refresh-error"
        authError="We could not reach Shikkha Buddy. Check your connection and try again."
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Your session is still saved")
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled()
    expect((await axe(container)).violations).toEqual([])
  })
})
