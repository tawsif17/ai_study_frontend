import { describe, expect, it } from "vitest"
import {
  entitlementErrorMessages,
  matchEntitlementErrorByExactMessage,
  validateContactSubmitRequest,
  validatePracticeGenerateRequest,
  validateQuestionReportRequest,
  validateQuestionsListRequest,
  validateRegisterRequest,
} from "../lib/api/contracts"
import { questionReportReasonOptions } from "../lib/api/types"
import { ApiClientError } from "../lib/api/client"

describe("matchEntitlementErrorByExactMessage", () => {
  it("matches exact entitlement message for 403", () => {
    const error = new ApiClientError({ message: entitlementErrorMessages.freeModeBlocked }, 403)
    expect(matchEntitlementErrorByExactMessage(error)).toEqual({
      type: "freeModeBlocked",
      message: entitlementErrorMessages.freeModeBlocked,
    })
  })

  it("does not match non-exact or non-403 errors", () => {
    const nonExact = new ApiClientError({ message: "Free plan supports only MCQ mode" }, 403)
    const wrongStatus = new ApiClientError({ message: entitlementErrorMessages.freeModeBlocked }, 400)

    expect(matchEntitlementErrorByExactMessage(nonExact)).toBeNull()
    expect(matchEntitlementErrorByExactMessage(wrongStatus)).toBeNull()
  })
})

describe("contract request validators", () => {
  it("validates closed beta register payload and password rules", () => {
    const valid = validateRegisterRequest({
      email: "student@example.com",
      password: "Password123",
      fullName: "Student Name",
      school: "Example High School",
      city: "Dhaka",
      studentClass: 10,
    })

    expect(valid).toEqual({
      email: "student@example.com",
      password: "Password123",
      fullName: "Student Name",
      school: "Example High School",
      city: "Dhaka",
      studentClass: 10,
    })

    expect(() =>
      validateRegisterRequest({
        email: "student@example.com",
        password: "password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
      })
    ).toThrow("Password must include at least one uppercase letter")

    expect(() =>
      validateRegisterRequest({
        email: "student@example.com",
        password: "Password123",
        fullName: "Student Name",
        school: "Example High School",
        city: "Dhaka",
        studentClass: 10,
        inviteCode: "extra",
      } as never)
    ).toThrow()
  })

  it("validates questions list required fields", () => {
    const valid = validateQuestionsListRequest({ exam_type_id: 1, subject_id: 2 })
    expect(valid).toEqual({ exam_type_id: 1, subject_id: 2 })

    expect(() => validateQuestionsListRequest({ exam_type_id: 1 } as never)).toThrow()
    expect(() =>
      validateQuestionsListRequest({ exam_type_id: 1, subject_id: 2, extra: "x" } as never)
    ).toThrow()
  })

  it("validates contact submit required fields and rejects extras", () => {
    const valid = validateContactSubmitRequest({
      name: "Student Name",
      email: "student@example.com",
      message: "I need help with the platform.",
    })

    expect(valid).toEqual({
      name: "Student Name",
      email: "student@example.com",
      message: "I need help with the platform.",
    })

    expect(() =>
      validateContactSubmitRequest({
        name: "Student Name",
        email: "student@example.com",
      } as never)
    ).toThrow()

    expect(() =>
      validateContactSubmitRequest({
        name: "Student Name",
        email: "student@example.com",
        message: "I need help with the platform.",
        subject: "Extra field",
      } as never)
    ).toThrow()
  })

  it("validates practice generate CHAPTERS requires chapter_ids", () => {
    const valid = validatePracticeGenerateRequest({
      exam_type_id: 1,
      subject_id: 2,
      mode: "MCQ",
      selection: { type: "CHAPTERS", chapter_ids: [5] },
    })

    expect(valid.selection.chapter_ids).toEqual([5])

    expect(() =>
      validatePracticeGenerateRequest({
        exam_type_id: 1,
        subject_id: 2,
        mode: "MCQ",
        selection: { type: "CHAPTERS" },
      })
    ).toThrow("selection.chapter_ids is required when selection.type is CHAPTERS")
  })

  it("accepts the exact saved-question session payload and rejects extra fields", () => {
    expect(validatePracticeGenerateRequest({
      exam_type_id: 1,
      subject_id: 2,
      mode: "MCQ",
      selection: { type: "BOOKMARKED" },
    })).toMatchObject({ selection: { type: "BOOKMARKED" } })

    expect(() => validatePracticeGenerateRequest({
      exam_type_id: 1,
      subject_id: 2,
      mode: "MCQ",
      selection: { type: "BOOKMARKED" },
      mcq_count: 10,
    })).toThrow("mcq_count is not allowed for BOOKMARKED selection")

    expect(() => validatePracticeGenerateRequest({
      exam_type_id: 1,
      subject_id: 2,
      mode: "CQ",
      selection: { type: "BOOKMARKED" },
    })).toThrow("BOOKMARKED selection supports only MCQ mode")
  })

  it("validates question report contract values and rejects readable labels", () => {
    const valid = validateQuestionReportRequest({
      reason_code: "OUT_OF_SYLLABUS",
      details: "This topic is no longer in the current SSC syllabus.",
    })

    expect(valid).toEqual({
      reason_code: "OUT_OF_SYLLABUS",
      details: "This topic is no longer in the current SSC syllabus.",
    })

    expect(questionReportReasonOptions.find((option) => option.label === "Out of Syllabus")).toEqual({
      label: "Out of Syllabus",
      value: "OUT_OF_SYLLABUS",
    })

    expect(() =>
      validateQuestionReportRequest({ reason_code: "Out of Syllabus" } as never)
    ).toThrow()
    expect(() => validateQuestionReportRequest({} as never)).toThrow()
    expect(() =>
      validateQuestionReportRequest({
        reason_code: "TYPO",
        details: "x".repeat(1001),
      })
    ).toThrow()
    expect(() =>
      validateQuestionReportRequest({
        reason_code: "TYPO",
        extra: "x",
      } as never)
    ).toThrow()
  })
})
