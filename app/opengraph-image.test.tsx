import type { ReactElement } from "react"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import OpenGraphImage, { size } from "./opengraph-image"

const imageResponseMock = vi.hoisted(() => vi.fn())

vi.mock("next/og", () => ({
  ImageResponse: imageResponseMock,
}))

describe("OpenGraphImage", () => {
  beforeEach(() => {
    imageResponseMock.mockClear()
  })

  it("embeds the approved monogram in the existing social-card dimensions", async () => {
    const approvedMonogram = await readFile(
      join(process.cwd(), "public", "shikkha-buddy-monogram.png"),
      "base64",
    )

    await OpenGraphImage()

    expect(imageResponseMock).toHaveBeenCalledOnce()

    const [card, dimensions] = imageResponseMock.mock.calls[0] as [ReactElement, typeof size]
    render(card)

    expect(dimensions).toEqual(size)
    expect(screen.getByText("Mathematics · Physics · Chemistry")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Shikkha Buddy monogram" })).toHaveAttribute(
      "src",
      `data:image/png;base64,${approvedMonogram}`,
    )
  })
})
