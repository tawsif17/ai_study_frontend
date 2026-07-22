import React from "react"
import "@testing-library/jest-dom/vitest"
import "vitest-axe/extend-expect"
import { vi } from "vitest"

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== "function") {
  const store = new Map<string, string>()

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      get length() {
        return store.size
      },
      clear() {
        store.clear()
      },
      getItem(key: string) {
        return store.get(key) ?? null
      },
      key(index: number) {
        return Array.from(store.keys())[index] ?? null
      },
      removeItem(key: string) {
        store.delete(key)
      },
      setItem(key: string, value: string) {
        store.set(key, String(value))
      },
    },
  })
}

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
