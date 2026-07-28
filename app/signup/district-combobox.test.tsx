import React, { useState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import { BANGLADESH_DISTRICT_NAMES, type DistrictName } from "@/lib/api"
import { DistrictCombobox } from "./district-combobox"

function DistrictComboboxHarness({ onChange = vi.fn() }: { onChange?: (value: DistrictName) => void }) {
  const [value, setValue] = useState<DistrictName | "">("")
  const [open, setOpen] = useState(false)

  return (
    <div>
      <label htmlFor="district">District</label>
      <DistrictCombobox
        id="district"
        value={value}
        districts={[...BANGLADESH_DISTRICT_NAMES]}
        open={open}
        onOpenChange={setOpen}
        onValueChange={(district) => {
          setValue(district)
          onChange(district)
        }}
      />
    </div>
  )
}

describe("DistrictCombobox", () => {
  it("filters locally, selects a canonical district, and restores trigger focus", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DistrictComboboxHarness onChange={onChange} />)

    const trigger = screen.getByRole("combobox", { name: "District" })
    await user.click(trigger)

    const search = screen.getByRole("combobox", { name: "Search districts" })
    await waitFor(() => expect(search).toHaveFocus())
    await user.type(search, "  CHAT  ")

    expect(screen.getByRole("option", { name: "Chattogram" })).toBeVisible()
    expect(screen.queryByRole("option", { name: "Dhaka" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: "Chattogram" }))

    expect(onChange).toHaveBeenCalledWith("Chattogram")
    expect(trigger).toHaveTextContent("Chattogram")
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("constrains the result viewport and supports keyboard selection", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DistrictComboboxHarness onChange={onChange} />)

    await user.click(screen.getByRole("combobox", { name: "District" }))
    const listbox = screen.getByRole("listbox")
    expect(listbox).toHaveClass("overflow-y-auto", "max-h-[min(300px,45vh)]")

    const search = screen.getByRole("combobox", { name: "Search districts" })
    await user.type(search, "sylh")
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onChange).toHaveBeenCalledWith("Sylhet")
  })

  it("shows an empty-search state and dismisses with Escape", async () => {
    const user = userEvent.setup()
    render(<DistrictComboboxHarness />)

    const trigger = screen.getByRole("combobox", { name: "District" })
    await user.click(trigger)
    const search = screen.getByRole("combobox", { name: "Search districts" })
    await user.type(search, "not-a-district")

    expect(screen.getByText("No district found.")).toBeVisible()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("has no detectable accessibility violations", async () => {
    const user = userEvent.setup()
    render(<DistrictComboboxHarness />)
    await user.click(screen.getByRole("combobox", { name: "District" }))

    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations
    ).toEqual([])
  })
})
