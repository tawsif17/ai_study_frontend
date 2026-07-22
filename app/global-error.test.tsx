import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RootGlobalError from "./global-error"
import { reportApplicationError } from "@/lib/telemetry"

vi.mock("@/lib/telemetry", () => ({ reportApplicationError: vi.fn() }))

describe("root global error", () => {
  it("reports only the digest and offers safe recovery", () => {
    const reset = vi.fn()
    render(<RootGlobalError error={Object.assign(new Error("private message"), { digest: "digest-123" })} reset={reset} />)

    expect(reportApplicationError).toHaveBeenCalledWith("root", "digest-123")
    expect(screen.queryByText("private message")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(reset).toHaveBeenCalledOnce()
    expect(screen.getByRole("link", { name: "Go to homepage" })).toHaveAttribute("href", "/")
  })
})
