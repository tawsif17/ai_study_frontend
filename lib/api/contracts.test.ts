import { describe, expect, it } from "vitest"
import { ApiClientError, ApiContractError } from "./client"
import {
  entitlementErrorMessages,
  matchEntitlementErrorByExactMessage,
  parseDistrictsResponse,
  parseAuthMeResponse,
  parseForgotPasswordResponse,
  parseResetPasswordResponse,
  validatePracticeGenerateRequest,
  validateRegisterRequest,
} from "./contracts"
import {
  BANGLADESH_DISTRICT_NAMES,
  type DistrictName,
  type RegisterRequest,
} from "./types"

const canonicalDistricts = [...BANGLADESH_DISTRICT_NAMES]

describe("district contracts", () => {
  it("accepts the exact canonical district response", () => {
    expect(parseDistrictsResponse({ districts: canonicalDistricts })).toEqual({
      districts: canonicalDistricts,
    })
  })

  it.each([
    ["missing", canonicalDistricts.slice(0, -1)],
    ["unknown", canonicalDistricts.map((district, index) => index === 0 ? "Unknown" : district)],
    ["duplicate", canonicalDistricts.map((district, index) => index === 1 ? "Bagerhat" : district)],
    ["reordered", [
      canonicalDistricts[1],
      canonicalDistricts[0],
      ...canonicalDistricts.slice(2),
    ]],
  ])("rejects a %s district response", (_case, districts) => {
    expect(() => parseDistrictsResponse({ districts })).toThrow(ApiContractError)
  })

  it("rejects additional district response fields", () => {
    expect(() =>
      parseDistrictsResponse({ districts: canonicalDistricts, total: 64 })
    ).toThrow(ApiContractError)
  })

  it("accepts canonical registration cities and rejects arbitrary values", () => {
    const request = {
      email: "student@example.com",
      password: "Password123",
      fullName: "Student Name",
      school: "Example School",
      city: "Dhaka" as DistrictName,
      studentClass: 10,
      academicGroup: "SCIENCE" as const,
      curriculumVersion: "ENGLISH" as const,
    }

    expect(validateRegisterRequest(request)).toEqual(request)
    expect(() =>
      validateRegisterRequest({
        ...request,
        city: "dhaka",
      } as unknown as RegisterRequest)
    ).toThrow("City must be a valid Bangladesh district")
  })

  it("requires canonical learning context values and rejects additions", () => {
    const request = {
      email: "student@example.com",
      password: "Password123",
      fullName: "Student Name",
      school: "Example School",
      city: "Dhaka" as DistrictName,
      studentClass: 10,
      academicGroup: "SCIENCE" as const,
      curriculumVersion: "ENGLISH" as const,
    }

    expect(validateRegisterRequest(request)).toEqual(request)
    expect(() => validateRegisterRequest({ ...request, academicGroup: "COMMERCE" } as never)).toThrow()
    expect(() => validateRegisterRequest({ ...request, curriculumVersion: "BENGALI" } as never)).toThrow()
    expect(() => validateRegisterRequest({ ...request, academicGroup: undefined } as never)).toThrow()
    expect(() => validateRegisterRequest({ ...request, extra: true } as never)).toThrow()
  })

  it("strictly parses learning context on authenticated users", () => {
    const user = {
      id: "student-id",
      email: "student@example.com",
      full_name: "Student Name",
      role: "student",
      plan_tier: "free" as const,
      school: null,
      city: "Dhaka",
      student_class: 10,
      academic_group: "SCIENCE" as const,
      curriculum_version: "ENGLISH" as const,
      email_verified_at: null,
      last_login_at: null,
      created_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-01T00:00:00.000Z",
    }

    expect(parseAuthMeResponse({ user })).toEqual({ user })
    expect(() => parseAuthMeResponse({ user: { ...user, academic_group: "COMMERCE" } })).toThrow(ApiContractError)
    expect(() => parseAuthMeResponse({ user: { ...user, curriculum_version: undefined } })).toThrow(ApiContractError)
    expect(() => parseAuthMeResponse({ user: { ...user, extra: true } })).toThrow(ApiContractError)
  })
})

describe("password recovery contracts", () => {
  it("accepts only the documented success messages", () => {
    expect(
      parseForgotPasswordResponse({
        message: "If the account is eligible, a password reset email has been sent.",
      })
    ).toEqual({
      message: "If the account is eligible, a password reset email has been sent.",
    })
    expect(
      parseResetPasswordResponse({
        message: "Password reset successful. Please log in with your new password.",
      })
    ).toEqual({
      message: "Password reset successful. Please log in with your new password.",
    })

    expect(() =>
      parseForgotPasswordResponse({ message: "Password reset email sent." })
    ).toThrow(ApiContractError)
    expect(() =>
      parseResetPasswordResponse({ message: "Password updated." })
    ).toThrow(ApiContractError)
  })
})

describe("practice entitlement request contracts", () => {
  const chapterRequest = {
    exam_type_id: 1,
    subject_id: 2,
    mode: "MCQ" as const,
    question_pool: "STANDARD" as const,
    mcq_count: 10,
    selection: { type: "CHAPTERS" as const, chapter_ids: [7] },
  }

  it("accepts Standard and Board-only chapter practice", () => {
    expect(validatePracticeGenerateRequest(chapterRequest)).toEqual(chapterRequest)
    expect(
      validatePracticeGenerateRequest({ ...chapterRequest, question_pool: "BOARD_ONLY" })
    ).toEqual({ ...chapterRequest, question_pool: "BOARD_ONLY" })
  })

  it("requires Board-only to use MCQ chapter selection", () => {
    expect(() =>
      validatePracticeGenerateRequest({
        ...chapterRequest,
        mode: "CQ",
        question_pool: "BOARD_ONLY",
      })
    ).toThrow("BOARD_ONLY question_pool supports only MCQ mode")
    expect(() =>
      validatePracticeGenerateRequest({
        ...chapterRequest,
        question_pool: "BOARD_ONLY",
        selection: { type: "FULL_SYLLABUS" },
      })
    ).toThrow("BOARD_ONLY question_pool requires CHAPTERS selection")
  })

  it("forbids question_pool and other generation inputs for Bookmarked practice", () => {
    expect(
      validatePracticeGenerateRequest({
        exam_type_id: 1,
        subject_id: 2,
        mode: "MCQ",
        selection: { type: "BOOKMARKED" },
      })
    ).toEqual({
      exam_type_id: 1,
      subject_id: 2,
      mode: "MCQ",
      selection: { type: "BOOKMARKED" },
    })
    expect(() =>
      validatePracticeGenerateRequest({
        ...chapterRequest,
        selection: { type: "BOOKMARKED" },
      })
    ).toThrow("question_pool is not allowed for BOOKMARKED selection")
  })

  it("classifies only the Board-only entitlement addition by its exact message", () => {
    const error = new ApiClientError(
      { message: entitlementErrorMessages.boardOnlyProRequired },
      403
    )
    expect(matchEntitlementErrorByExactMessage(error)).toEqual({
      type: "boardOnlyProRequired",
      message: entitlementErrorMessages.boardOnlyProRequired,
    })
  })
})
