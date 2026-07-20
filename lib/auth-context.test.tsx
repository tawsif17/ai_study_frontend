import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "./auth-context"
import { clearAuthToken } from "./api/client"

const mockMutate = vi.fn()

vi.mock("swr", () => ({
  useSWRConfig: () => ({ mutate: mockMutate }),
}))

vi.mock("./api/client", () => ({
  clearAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}))

vi.mock("./api", () => ({
  getAuthMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>Logout</button>
}

describe("AuthProvider logout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("clears auth-scoped SWR cache keys", () => {
    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    expect(clearAuthToken).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledTimes(1)
    const [matcher, value, options] = mockMutate.mock.calls[0]

    expect(value).toBeUndefined()
    expect(options).toEqual({ revalidate: false })
    expect(matcher(["subjects", "SSC"])).toBe(true)
    expect(matcher(["questions", { subject_id: 5 }])).toBe(true)
    expect(matcher(["practice-summary", 9])).toBe(true)
    expect(matcher(["practice-items", 9, "MCQ"])).toBe(true)
    expect(matcher(["practice-answers", 9])).toBe(true)
    expect(matcher(["practice-results", 9, "MCQ", 1, 10])).toBe(true)
    expect(matcher(["progress-dashboard"])).toBe(true)
    expect(matcher("revision-summary")).toBe(true)
    expect(matcher(["revision-items", "bookmarks", undefined, undefined, 1, 20])).toBe(true)
    expect(matcher(["exam-types"])).toBe(false)
    expect(matcher("subjects")).toBe(false)
  })
})
