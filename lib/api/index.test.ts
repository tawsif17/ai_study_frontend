import { beforeEach, describe, expect, it, vi } from "vitest"
import { resendVerification, verifyEmail } from "./index"
import { apiClient } from "./client"

vi.mock("./client", () => ({
  apiClient: vi.fn(),
}))

describe("auth API contract calls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls verify email endpoint with exact contract payload", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ message: "Email verified successfully" })

    await verifyEmail({ token: "abc-token" })

    expect(apiClient).toHaveBeenCalledWith("/auth/verify-email", {
      method: "POST",
      body: { token: "abc-token" },
    })
  })

  it("calls resend verification endpoint with exact contract payload", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      message: "If the account is eligible, a verification email has been sent.",
    })

    await resendVerification({ email: "student@example.com" })

    expect(apiClient).toHaveBeenCalledWith("/auth/resend-verification", {
      method: "POST",
      body: { email: "student@example.com" },
    })
  })
})
