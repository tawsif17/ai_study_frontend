import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "./auth-context"
import { ApiClientError, clearAuthToken } from "./api/client"

const mockMutate = vi.fn()

vi.mock("swr", () => ({
  useSWRConfig: () => ({ mutate: mockMutate }),
}))

vi.mock("./api/client", () => {
  class MockApiClientError extends Error {
    status: number

    constructor(_error: { message: string }, status: number) {
      super(_error.message)
      this.status = status
    }
  }

  return {
    ApiClientError: MockApiClientError,
    clearAuthToken: vi.fn(),
    formatApiError: (error: Error) => error.message,
    setAuthToken: vi.fn(),
  }
})

vi.mock("./api", () => ({
  getAuthMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>Logout</button>
}

function AuthState() {
  const { authStatus, isAuthenticated } = useAuth()
  return <p>{`${authStatus}:${isAuthenticated}`}</p>
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

describe("AuthProvider refresh recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem("auth_token", "stored-token")
  })

  it("keeps a stored session when refresh has a temporary failure", async () => {
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe).mockRejectedValueOnce(new Error("Network unavailable"))

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByText("retryable-refresh-error:true")).toBeInTheDocument())
    expect(clearAuthToken).not.toHaveBeenCalled()
  })

  it("clears the stored session only when refresh confirms a 401", async () => {
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe).mockRejectedValueOnce(new ApiClientError({ message: "Expired" }, 401))

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByText("unauthenticated:false")).toBeInTheDocument())
    expect(clearAuthToken).toHaveBeenCalledTimes(1)
  })
})
