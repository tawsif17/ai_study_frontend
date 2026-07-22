import { beforeEach, describe, expect, it, vi } from "vitest"
import { getAuthMe, getCompleteResults, getPracticeItems, getProgressDashboard, getRevisionItems, getRevisionSummary, login, register, removeBookmark, reportQuestion, resendVerification, saveBookmark, submitContact, upgradeToPro, verifyEmail } from "./index"
import { ApiContractError, apiClient, apiClientWithResponse } from "./client"

vi.mock("./client", () => ({
  ApiClientError: class ApiClientError extends Error {},
  ApiContractError: class ApiContractError extends Error {},
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

describe("revision API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("preserves the private-beta 202 registration result", async () => {
    vi.mocked(apiClientWithResponse).mockResolvedValueOnce({
      data: { message: "Your private beta request has been received." },
      status: 202,
    })

    await expect(
      register({
        email: "student@example.com",
        password: "Password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
      })
    ).resolves.toEqual({
      data: { message: "Your private beta request has been received." },
      status: 202,
    })
  })

  it("normalizes auth emails and validates login and account responses", async () => {
    const user = {
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
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ user, token: "signed-token" })
      .mockResolvedValueOnce({ user })

    await expect(login({ email: " Student@Example.COM ", password: "Password123" })).resolves.toEqual({
      user,
      token: "signed-token",
    })
    await expect(getAuthMe()).resolves.toEqual({ user })

    expect(apiClient).toHaveBeenNthCalledWith(1, "/auth/login", {
      method: "POST",
      body: { email: "student@example.com", password: "Password123" },
    })
    expect(apiClient).toHaveBeenNthCalledWith(2, "/auth/me", { requiresAuth: true })
  })

  it("rejects unrecognized registration success statuses and malformed auth payloads", async () => {
    vi.mocked(apiClientWithResponse).mockResolvedValueOnce({
      data: { message: "Unexpected success" },
      status: 200,
    })

    await expect(
      register({
        email: "student@example.com",
        password: "Password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
      })
    ).rejects.toBeInstanceOf(ApiContractError)

    vi.mocked(apiClient).mockResolvedValueOnce({ token: "missing-user" })
    await expect(
      login({ email: "student@example.com", password: "Password123" })
    ).rejects.toBeInstanceOf(ApiContractError)
  })

  it("uses authenticated revision list and summary endpoints", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ page: 1, page_size: 20, total: 0, items: [] })
    vi.mocked(apiClient).mockResolvedValueOnce({ bookmark_total: 0, active_mistake_total: 0, saved_question_total: 0, subjects: [] })

    await getRevisionItems("bookmarks", { subject_id: 2, chapter_id: 7, page: 2, page_size: 20 })
    await getRevisionSummary()

    expect(apiClient).toHaveBeenNthCalledWith(1, "/revision/bookmarks", {
      params: { subject_id: 2, chapter_id: 7, page: 2, page_size: 20 },
      requiresAuth: true,
    })
    expect(apiClient).toHaveBeenNthCalledWith(2, "/revision/summary", { requiresAuth: true })
  })

  it("saves from a practice item and removes only a manual bookmark", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ question_id: 42, bookmarked: true, bookmarked_at: "2026-07-20T00:00:00.000Z" })
    vi.mocked(apiClient).mockResolvedValueOnce({ question_id: 42, bookmarked: false })

    await saveBookmark(9)
    await removeBookmark(42)

    expect(apiClient).toHaveBeenNthCalledWith(1, "/revision/bookmarks/practice-items/9", { method: "PUT", requiresAuth: true })
    expect(apiClient).toHaveBeenNthCalledWith(2, "/revision/bookmarks/questions/42", { method: "DELETE", requiresAuth: true })
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

  it("normalizes duplicate items from the paginated contract response", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      practice_session_id: 12,
      section: "MCQ",
      page: 1,
      page_size: 20,
      total_in_section: 3,
      items: [item(2), item(1), item(2)],
    })

    await expect(getPracticeItems(12, "MCQ")).resolves.toEqual([item(1), item(2)])
    expect(apiClient).toHaveBeenCalledTimes(1)
    expect(apiClient).toHaveBeenCalledWith("/practice/12/items", {
      params: { section: "MCQ", page: 1, page_size: 20 },
      requiresAuth: true,
    })
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

describe("complete practice results pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const resultItem = (number: number) => ({
    section_order_no: number,
    order_no: number,
    practice_item_id: 100 + number,
    question: {
      id: 200 + number,
      question_type: "MCQ" as const,
      stem_text: `Question ${number}`,
      explanation: null,
      difficulty: 1,
      source: null,
      language: "en" as const,
    },
    user_answer: { selected_option_label: "A" },
    mcq: {
      correct_option_label: "A",
      is_correct: true,
      options: [{ label: "A", option_text: "Answer" }],
    },
    media: [],
  })

  const page = (pageNumber: number, total: number, items: ReturnType<typeof resultItem>[]) => ({
    practice_session_id: 12,
    section: "MCQ" as const,
    page: pageNumber,
    page_size: 20,
    total_in_section: total,
    items,
  })

  it("loads a complete single-page result set with the largest supported page size", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(page(1, 2, [resultItem(2), resultItem(1)]))

    await expect(getCompleteResults(12)).resolves.toMatchObject({
      total_in_section: 2,
      items: [resultItem(1), resultItem(2)],
    })
    expect(apiClient).toHaveBeenCalledWith("/practice/12/results", {
      params: { section: "MCQ", page: 1, page_size: 20 },
      requiresAuth: true,
    })
  })

  it("returns a valid empty complete result set", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(page(1, 0, []))

    await expect(getCompleteResults(12)).resolves.toMatchObject({
      total_in_section: 0,
      items: [],
    })
    expect(apiClient).toHaveBeenCalledTimes(1)
  })

  it("propagates a first-page failure without exposing result data", async () => {
    vi.mocked(apiClient).mockRejectedValueOnce(new Error("Results unavailable"))

    await expect(getCompleteResults(12)).rejects.toThrow("Results unavailable")
    expect(apiClient).toHaveBeenCalledTimes(1)
  })

  it("calculates and loads every remaining page before exposing ordered results", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce(page(1, 41, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))))
      .mockResolvedValueOnce(page(2, 41, Array.from({ length: 20 }, (_, index) => resultItem(index + 21)).reverse()))
      .mockResolvedValueOnce(page(3, 41, [resultItem(41)]))

    const result = await getCompleteResults(12, "MCQ")

    expect(result.items.map((item) => item.section_order_no)).toEqual(
      Array.from({ length: 41 }, (_, index) => index + 1)
    )
    expect(apiClient).toHaveBeenCalledTimes(3)
  })

  it("loads exactly one remaining page for a 25-question session", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce(page(1, 25, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))))
      .mockResolvedValueOnce(page(2, 25, Array.from({ length: 5 }, (_, index) => resultItem(index + 21))))

    await expect(getCompleteResults(12)).resolves.toMatchObject({ total_in_section: 25 })
    expect(apiClient).toHaveBeenNthCalledWith(1, "/practice/12/results", {
      params: { section: "MCQ", page: 1, page_size: 20 },
      requiresAuth: true,
    })
    expect(apiClient).toHaveBeenNthCalledWith(2, "/practice/12/results", {
      params: { section: "MCQ", page: 2, page_size: 20 },
      requiresAuth: true,
    })
    expect(apiClient).toHaveBeenCalledTimes(2)
  })

  it("rejects duplicate question numbers instead of silently merging them", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(page(1, 2, [resultItem(1), { ...resultItem(2), section_order_no: 1 }]))

    await expect(getCompleteResults(12)).rejects.toThrow("duplicate question numbers")
  })

  it("rejects an incomplete merged result so no partial score can be shown", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(page(1, 2, [resultItem(1)]))

    await expect(getCompleteResults(12)).rejects.toThrow("response is incomplete")
  })

  it("rejects a missing later-page item instead of returning a partial session", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce(page(1, 21, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))))
      .mockResolvedValueOnce(page(2, 21, []))

    await expect(getCompleteResults(12)).rejects.toThrow("response is incomplete")
  })

  it("rejects a gap in question numbering even when the item count matches", async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(page(1, 2, [resultItem(1), resultItem(3)]))

    await expect(getCompleteResults(12)).rejects.toThrow("response is incomplete")
  })

  it("rejects an inconsistent first-page session, section, or total before loading more pages", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ ...page(1, 21, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))), practice_session_id: 99 })

    await expect(getCompleteResults(12)).rejects.toThrow("response is inconsistent")
    expect(apiClient).toHaveBeenCalledTimes(1)

    vi.mocked(apiClient).mockReset()
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ ...page(1, 20, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))), total_in_section: -1 })

    await expect(getCompleteResults(12)).rejects.toThrow("response is inconsistent")
    expect(apiClient).toHaveBeenCalledTimes(1)

    vi.mocked(apiClient).mockReset()
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ ...page(1, 51, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))) })

    await expect(getCompleteResults(12)).rejects.toThrow("response is inconsistent")
    expect(apiClient).toHaveBeenCalledTimes(1)

    vi.mocked(apiClient).mockReset()
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ ...page(1, 21, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))), page_size: 21 })

    await expect(getCompleteResults(12)).rejects.toThrow("response is inconsistent")
    expect(apiClient).toHaveBeenCalledTimes(1)
  })

  it("rejects an inconsistent total reported by a later page", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce(page(1, 21, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))))
      .mockResolvedValueOnce(page(2, 22, [resultItem(21)]))

    await expect(getCompleteResults(12)).rejects.toThrow("response is inconsistent")
  })

  it("propagates a later-page failure and never returns a partial result", async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce(page(1, 21, Array.from({ length: 20 }, (_, index) => resultItem(index + 1))))
      .mockRejectedValueOnce(new Error("Page 2 unavailable"))

    await expect(getCompleteResults(12)).rejects.toThrow("Page 2 unavailable")
  })
})
