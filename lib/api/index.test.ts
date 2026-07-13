import { beforeEach, describe, expect, it, vi } from "vitest"
import { getPracticeItems, getProgressDashboard, register, reportQuestion, resendVerification, submitContact, upgradeToPro, verifyEmail } from "./index"
import { apiClient, apiClientWithResponse } from "./client"

vi.mock("./client", () => ({
  apiClient: vi.fn(),
  apiClientWithResponse: vi.fn(),
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

  it("calls register endpoint with exact closed beta contract payload and preserves status", async () => {
    vi.mocked(apiClientWithResponse).mockResolvedValueOnce({
      data: { message: "Registration successful. You can now log in." },
      status: 201,
    })

    const response = await register({
      email: "student@example.com",
      password: "Password123",
      fullName: " Student Name ",
      school: "Example High School",
      city: "Dhaka",
      studentClass: 10,
    })

    expect(response).toEqual({
      data: { message: "Registration successful. You can now log in." },
      status: 201,
    })
    expect(apiClientWithResponse).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        email: "student@example.com",
        password: "Password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
      },
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

  it("calls upgrade to pro endpoint with exact contract payload", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      message: "Upgrade successful. Pro trial is now active.",
      plan_tier: "pro",
    })

    await upgradeToPro()

    expect(apiClient).toHaveBeenCalledWith("/auth/upgrade-to-pro", {
      method: "POST",
      body: {},
      requiresAuth: true,
    })
  })

  it("calls contact endpoint with exact contract payload", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      message: "Contact message submitted successfully.",
    })

    await submitContact({
      name: " Student Name ",
      email: " student@example.com ",
      message: " I need help with the platform. ",
    })

    expect(apiClient).toHaveBeenCalledWith("/contact", {
      method: "POST",
      body: {
        name: "Student Name",
        email: "student@example.com",
        message: "I need help with the platform.",
      },
      includeAuth: true,
    })
  })

  it("calls question report endpoint with mapped contract payload", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: 1,
      question_id: 123,
      reason_code: "OUT_OF_SYLLABUS",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })

    await reportQuestion(123, {
      reason_code: "OUT_OF_SYLLABUS",
      details: " This topic is no longer in the current SSC syllabus. ",
    })

    expect(apiClient).toHaveBeenCalledWith("/questions/123/reports", {
      method: "POST",
      body: {
        reason_code: "OUT_OF_SYLLABUS",
        details: "This topic is no longer in the current SSC syllabus.",
      },
      requiresAuth: true,
    })
  })

  it("omits blank question report details", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: 2,
      question_id: 123,
      reason_code: "TYPO",
      status: "OPEN",
      message: "Question report submitted successfully.",
      created_at: "2026-07-02T00:00:00.000Z",
    })

    await reportQuestion(123, {
      reason_code: "TYPO",
      details: "   ",
    })

    expect(apiClient).toHaveBeenCalledWith("/questions/123/reports", {
      method: "POST",
      body: {
        reason_code: "TYPO",
      },
      requiresAuth: true,
    })
  })
})

describe("progress dashboard API contract", () => {
  it("uses the exact authenticated endpoint and preserves the unwrapped contract", async () => {
    const dashboard = {
      message: null,
      proficiency: { score: 68, trend_vs_last_week: 6 },
      weakness_ranking: [],
      recommendation: null,
    }
    vi.mocked(apiClient).mockResolvedValueOnce(dashboard)

    await expect(getProgressDashboard()).resolves.toEqual(dashboard)
    expect(apiClient).toHaveBeenCalledWith("/profile/progress-dashboard", {
      requiresAuth: true,
    })
  })
})

describe("practice items pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const item = (number: number) => ({
    practice_item_id: number,
    question_id: 100 + number,
    order_no: number,
    section_order_no: number,
  })

  it("loads, combines, and orders every page in a 25-question session", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce({
        practice_session_id: 12,
        section: "MCQ",
        page: 1,
        page_size: 20,
        total_in_section: 25,
        items: Array.from({ length: 20 }, (_, index) => item(index + 1)),
      })
      .mockResolvedValueOnce({
        practice_session_id: 12,
        section: "MCQ",
        page: 2,
        page_size: 20,
        total_in_section: 25,
        items: Array.from({ length: 5 }, (_, index) => item(index + 21)).reverse(),
      })

    const result = await getPracticeItems(12, "MCQ")

    expect(result).toHaveLength(25)
    expect(result.map(({ section_order_no }) => section_order_no)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1)
    )
    expect(apiClient).toHaveBeenNthCalledWith(1, "/practice/12/items", {
      params: { section: "MCQ", page: 1, page_size: 20 },
      requiresAuth: true,
    })
    expect(apiClient).toHaveBeenNthCalledWith(2, "/practice/12/items", {
      params: { section: "MCQ", page: 2, page_size: 20 },
      requiresAuth: true,
    })
  })

  it("preserves a legacy array response while removing duplicate items", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce([item(2), item(1), item(2)])

    await expect(getPracticeItems(12, "MCQ")).resolves.toEqual([item(1), item(2)])
    expect(apiClient).toHaveBeenCalledTimes(1)
  })

  it("rejects the full load when a later page fails", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce({
        practice_session_id: 12,
        section: "MCQ",
        page: 1,
        page_size: 20,
        total_in_section: 25,
        items: Array.from({ length: 20 }, (_, index) => item(index + 1)),
      })
      .mockRejectedValueOnce(new Error("Page 2 unavailable"))

    await expect(getPracticeItems(12, "MCQ")).rejects.toThrow("Page 2 unavailable")
  })
})
