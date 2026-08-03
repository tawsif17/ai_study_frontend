"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DistrictName } from "@/lib/api"

interface DistrictComboboxProps {
  id: string
  value: DistrictName | ""
  districts: DistrictName[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onValueChange: (value: DistrictName) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

export function DistrictCombobox({
  id,
  value,
  districts,
  open,
  onOpenChange,
  onValueChange,
  disabled = false,
  invalid = false,
  describedBy,
}: DistrictComboboxProps) {
  const [search, setSearch] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const popoverId = `${id}-popover`
  const normalizedSearch = search.trim().toLocaleLowerCase("en")
  const filteredDistricts = useMemo(
    () =>
      normalizedSearch
        ? districts.filter((district) =>
            district.toLocaleLowerCase("en").includes(normalizedSearch)
          )
        : districts,
    [districts, normalizedSearch]
  )

  useEffect(() => {
    if (!open) {
      setSearch("")
      return
    }

    const animationFrame = requestAnimationFrame(() => searchInputRef.current?.focus())
    return () => cancelAnimationFrame(animationFrame)
  }, [open])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={popoverId}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
          className="w-full justify-between bg-background px-3 font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Select a district"}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={popoverId}
        aria-label="District selection"
        align="start"
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
      >
        <Command shouldFilter={false} label="Search districts">
          <CommandInput
            ref={searchInputRef}
            value={search}
            onValueChange={setSearch}
            placeholder="Search districts..."
            aria-label="Search districts"
          />
          <CommandList
            className="max-h-[min(300px,45vh)] overflow-y-auto overscroll-contain"
          >
            <CommandEmpty>No district found.</CommandEmpty>
            {filteredDistricts.map((district) => (
              <CommandItem
                key={district}
                value={district}
                aria-selected={value === district}
                onSelect={() => {
                  onValueChange(district)
                  onOpenChange(false)
                }}
              >
                <Check
                  className={cn("size-4", value === district ? "opacity-100" : "opacity-0")}
                  aria-hidden="true"
                />
                {district}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
