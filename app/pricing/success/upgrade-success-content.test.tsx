import type React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UpgradeSuccessContent } from "./upgrade-success-content"

const mockGet = vi.fn()

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("upgrade success content", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses next query for continue CTA when valid", () => {
    mockGet.mockImplementation((key: string) => (key === "next" ? "/subjects/9" : null))
    render(<UpgradeSuccessContent />)

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/subjects/9")
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/subjects")
  })

  it("falls back to /subjects when next query is invalid", () => {
    mockGet.mockImplementation((key: string) => (key === "next" ? "https://example.com" : null))
    render(<UpgradeSuccessContent />)

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/subjects")
  })
})
