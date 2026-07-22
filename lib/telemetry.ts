export type ApplicationErrorBoundary = "root" | "route"

export interface ApplicationErrorTelemetryEvent {
  type: "application-error"
  boundary: ApplicationErrorBoundary
  digest?: string
}

export interface WebVitalTelemetryEvent {
  type: "web-vital"
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB"
  value: number
  delta: number
  rating: "good" | "needs-improvement" | "poor"
}

export type TelemetryEvent = ApplicationErrorTelemetryEvent | WebVitalTelemetryEvent

export interface TelemetrySink {
  report(event: TelemetryEvent): void
}

const noOpTelemetrySink: TelemetrySink = { report: () => undefined }
let telemetrySink: TelemetrySink = noOpTelemetrySink

export function setTelemetrySink(sink: TelemetrySink): () => void {
  telemetrySink = sink
  return () => {
    telemetrySink = noOpTelemetrySink
  }
}

function sanitizeDigest(digest: string | undefined): string | undefined {
  if (!digest) return undefined
  return /^[A-Za-z0-9_-]{1,128}$/.test(digest) ? digest : undefined
}

export function reportApplicationError(boundary: ApplicationErrorBoundary, digest?: string): void {
  const safeDigest = sanitizeDigest(digest)
  telemetrySink.report({
    type: "application-error",
    boundary,
    ...(safeDigest ? { digest: safeDigest } : {}),
  })
}

export function reportWebVital(metric: {
  name: string
  value: number
  delta: number
  rating: string
}): void {
  const supportedNames = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"])
  const supportedRatings = new Set(["good", "needs-improvement", "poor"])

  if (
    !supportedNames.has(metric.name) ||
    !supportedRatings.has(metric.rating) ||
    !Number.isFinite(metric.value) ||
    !Number.isFinite(metric.delta)
  ) {
    return
  }

  telemetrySink.report({
    type: "web-vital",
    name: metric.name as WebVitalTelemetryEvent["name"],
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating as WebVitalTelemetryEvent["rating"],
  })
}
