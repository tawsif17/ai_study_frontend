import { describe, expect, it } from "vitest"
import { ApiContractError } from "./client"
import { parseDistrictsResponse, validateRegisterRequest } from "./contracts"
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
    }

    expect(validateRegisterRequest(request)).toEqual(request)
    expect(() =>
      validateRegisterRequest({
        ...request,
        city: "dhaka",
      } as unknown as RegisterRequest)
    ).toThrow("City must be a valid Bangladesh district")
  })
})
