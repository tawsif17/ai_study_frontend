"use client"

import { useReportWebVitals } from "next/web-vitals"
import { reportWebVital } from "@/lib/telemetry"

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVital)
  return null
}
