import { describe, expect, it, vi } from "vitest"
import { reportApplicationError, reportWebVital, setTelemetrySink, type TelemetryEvent } from "./telemetry"

describe("privacy-safe telemetry", () => {
  it("reports only a safe digest and boundary for application errors", () => {
    const report = vi.fn<(event: TelemetryEvent) => void>()
    const restore = setTelemetrySink({ report })

    reportApplicationError("root", "safe_digest-123")
    reportApplicationError("route", "bad?email=student@example.com")

    expect(report).toHaveBeenNthCalledWith(1, {
      type: "application-error",
      boundary: "root",
      digest: "safe_digest-123",
    })
    expect(report).toHaveBeenNthCalledWith(2, {
      type: "application-error",
      boundary: "route",
    })
    restore()
  })

  it("allowlists Web Vital fields and ignores unsupported input", () => {
    const report = vi.fn<(event: TelemetryEvent) => void>()
    const restore = setTelemetrySink({ report })

    reportWebVital({ name: "LCP", value: 2100, delta: 75, rating: "good", id: "ignored" } as never)
    reportWebVital({ name: "custom", value: 1, delta: 1, rating: "good" })

    expect(report).toHaveBeenCalledOnce()
    expect(report).toHaveBeenCalledWith({
      type: "web-vital",
      name: "LCP",
      value: 2100,
      delta: 75,
      rating: "good",
    })
    restore()
  })
})
