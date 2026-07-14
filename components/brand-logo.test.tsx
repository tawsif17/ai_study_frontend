import type { ImageProps } from "next/image"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { BrandLogo } from "./brand-logo"

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className }: ImageProps) => (
    <span
      role="img"
      aria-label={alt}
      data-src={String(src)}
      data-width={String(width)}
      data-height={String(height)}
      className={className}
    />
  ),
}))

describe("BrandLogo", () => {
  it("renders the production horizontal lockup at its intrinsic aspect ratio", () => {
    render(<BrandLogo className="h-10" priority />)

    const logo = screen.getByRole("img", { name: "Shikkha Buddy" })

    expect(logo).toHaveAttribute("data-src", "/shikkha-buddy-logo.svg")
    expect(logo).toHaveAttribute("data-width", "877")
    expect(logo).toHaveAttribute("data-height", "136")
    expect(logo).toHaveClass("h-10", "w-auto")
  })
})
