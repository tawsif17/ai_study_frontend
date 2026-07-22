import type React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import GlobalError from "./error"

vi.mock("@/components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

it("offers an accessible retry and homepage recovery path", async () => {
  const reset = vi.fn()
  const { container } = render(<GlobalError error={new Error("Failed")} reset={reset} />)

  fireEvent.click(screen.getByRole("button", { name: "Try again" }))
  expect(reset).toHaveBeenCalledTimes(1)
  expect(screen.getByRole("link", { name: "Go to homepage" })).toHaveAttribute("href", "/")
  expect((await axe(container)).violations).toEqual([])
})
