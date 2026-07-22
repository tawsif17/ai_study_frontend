import type React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import GlobalError from "./error"
import { reportApplicationError } from "@/lib/telemetry"

vi.mock("@/lib/telemetry", () => ({ reportApplicationError: vi.fn() }))

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

it("offers an accessible retry and homepage recovery path", async () => {
  const reset = vi.fn()
  const error = Object.assign(new Error("Failed"), { digest: "digest-456" })
  const { container } = render(<GlobalError error={error} reset={reset} />)

  expect(reportApplicationError).toHaveBeenCalledWith("route", "digest-456")
  fireEvent.click(screen.getByRole("button", { name: "Try again" }))
  expect(reset).toHaveBeenCalledTimes(1)
  expect(screen.getByRole("link", { name: "Go to homepage" })).toHaveAttribute("href", "/")
  expect((await axe(container)).violations).toEqual([])
})
