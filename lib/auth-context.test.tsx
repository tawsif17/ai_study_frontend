import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "./auth-context"
import { ApiClientError, clearAuthToken } from "./api/client"

const mockMutate = vi.fn()

afterEach(() => {
  vi.unstubAllGlobals()
})

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

function LoginButton() {
  const { login } = useAuth()
  return (
    <button onClick={() => void login({ email: "student@example.com", password: "Password123" })}>
      Login
    </button>
  )
}

function AuthState() {
  const { authStatus, isAuthenticated, user } = useAuth()
  return <p>{`${authStatus}:${isAuthenticated}:${user?.email ?? "no-user"}`}</p>
}

const authUser = {
  id: "student-id",
  email: "student@example.com",
  full_name: "Student Name",
  role: "student",
  plan_tier: "free" as const,
  school: null,
  city: null,
  student_class: 10,
  email_verified_at: "2026-07-20T00:00:00.000Z",
  last_login_at: null,
  created_at: "2026-07-20T00:00:00.000Z",
  updated_at: "2026-07-20T00:00:00.000Z",
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

    await waitFor(() => expect(screen.getByText("retryable-refresh-error:true:no-user")).toBeInTheDocument())
    expect(clearAuthToken).not.toHaveBeenCalled()
  })

  it("clears the stored session only when refresh confirms a 401", async () => {
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe).mockRejectedValueOnce(new ApiClientError({ message: "Expired" }, 401))

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByText("unauthenticated:false:no-user")).toBeInTheDocument())
    expect(clearAuthToken).toHaveBeenCalledTimes(1)
  })

  it("offers a global retry action and restores the account after recovery", async () => {
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe)
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ user: authUser })

    render(<AuthProvider><AuthState /></AuthProvider>)

    const retry = await screen.findByRole("button", { name: "Retry" })
    fireEvent.click(retry)

    await waitFor(() =>
      expect(screen.getByText("authenticated:true:student@example.com")).toBeInTheDocument()
    )
    expect(screen.queryByText("We could not refresh your account")).not.toBeInTheDocument()
    expect(clearAuthToken).not.toHaveBeenCalled()
  })

  it("applies logout events received through the storage fallback", async () => {
    vi.stubGlobal("BroadcastChannel", undefined)
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe).mockResolvedValueOnce({ user: authUser })

    render(<AuthProvider><AuthState /></AuthProvider>)
    await screen.findByText("authenticated:true:student@example.com")

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "shikkha_buddy_auth_sync",
        newValue: JSON.stringify({ type: "logout", sentAt: Date.now() }),
      })
    )

    await waitFor(() =>
      expect(screen.getByText("unauthenticated:false:no-user")).toBeInTheDocument()
    )
    expect(clearAuthToken).toHaveBeenCalledTimes(1)
  })

  it("refreshes the account for login events received through the storage fallback", async () => {
    vi.stubGlobal("BroadcastChannel", undefined)
    localStorage.clear()
    const { getAuthMe } = await import("./api")
    vi.mocked(getAuthMe).mockResolvedValueOnce({ user: authUser })

    render(<AuthProvider><AuthState /></AuthProvider>)
    await screen.findByText("unauthenticated:false:no-user")

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "shikkha_buddy_auth_sync",
        newValue: JSON.stringify({ type: "login", sentAt: Date.now() }),
      })
    )

    await waitFor(() =>
      expect(screen.getByText("authenticated:true:student@example.com")).toBeInTheDocument()
    )
  })

  it("broadcasts local login and logout changes when BroadcastChannel is available", async () => {
    localStorage.clear()
    const posted: unknown[] = []
    class MockBroadcastChannel {
      constructor(name: string) {
        void name
      }
      addEventListener() {}
      postMessage(message: unknown) {
        posted.push(message)
      }
      close() {}
    }
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel)
    const { login } = await import("./api")
    vi.mocked(login).mockResolvedValueOnce({ user: authUser, token: "new-token" })

    render(
      <AuthProvider>
        <AuthState />
        <LoginButton />
        <LogoutButton />
      </AuthProvider>
    )
    await screen.findByText("unauthenticated:false:no-user")

    fireEvent.click(screen.getByRole("button", { name: "Login" }))
    await screen.findByText("authenticated:true:student@example.com")
    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    expect(posted).toEqual([
      expect.objectContaining({ type: "login" }),
      expect.objectContaining({ type: "logout" }),
    ])
  })

  it("does not restore a session when an older refresh completes after logout", async () => {
    const { getAuthMe } = await import("./api")
    let resolveRefresh: ((value: { user: typeof authUser }) => void) | undefined
    vi.mocked(getAuthMe).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveRefresh = resolve
      })
    )

    render(
      <AuthProvider>
        <AuthState />
        <LogoutButton />
      </AuthProvider>
    )
    await waitFor(() => expect(getAuthMe).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    await act(async () => resolveRefresh?.({ user: authUser }))

    expect(screen.getByText("unauthenticated:false:no-user")).toBeInTheDocument()
  })
})
