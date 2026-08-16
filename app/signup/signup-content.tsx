"use client"

import React, { useState } from "react"
import Link from "next/link"
import { AlertCircle, MailCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "@/components/icons"
import { useAuth } from "@/lib/auth-context"
import { ApiClientError, formatApiError } from "@/lib/api/client"
import { useDistricts } from "@/lib/api/hooks"
import type { AcademicGroup, CurriculumVersion, DistrictName } from "@/lib/api"
import {
  isUncertainSignupDeliveryError,
  isValidVerificationEmail,
  normalizeVerificationEmail,
} from "@/lib/verification-form-recovery"
import { DistrictCombobox } from "./district-combobox"

type SignupField =
  | "name"
  | "email"
  | "password"
  | "confirmPassword"
  | "school"
  | "city"
  | "class"
  | "academicGroup"
  | "curriculumVersion"
type SignupFieldErrors = Partial<Record<SignupField, string>>

export function SignupContent() {
  const { register } = useAuth()
  const {
    districts,
    isLoading: districtsLoading,
    isValidating: districtsValidating,
    isError: districtsError,
    mutate: retryDistricts,
  } = useDistricts()

  const [isLoading, setIsLoading] = useState(false)
  const [districtOpen, setDistrictOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [deliveryUncertain, setDeliveryUncertain] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})
  const [formData, setFormData] = useState<{
    name: string
    email: string
    password: string
    confirmPassword: string
    school: string
    city: DistrictName | ""
    class: string
    academicGroup: AcademicGroup | ""
    curriculumVersion: CurriculumVersion | ""
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    city: "",
    class: "",
    academicGroup: "",
    curriculumVersion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = normalizeVerificationEmail(formData.email)
    const selectedDistrict = formData.city
    const nextFieldErrors: SignupFieldErrors = {}
    if (!formData.name.trim()) nextFieldErrors.name = "Enter your full name."
    if (!isValidVerificationEmail(normalizedEmail)) nextFieldErrors.email = "Enter a valid email address."
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      nextFieldErrors.password = "Use at least 8 characters with uppercase, lowercase, and a number."
    }
    if (!formData.confirmPassword) {
      nextFieldErrors.confirmPassword = "Confirm your password."
    } else if (formData.password !== formData.confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match."
    }
    if (!formData.school.trim()) nextFieldErrors.school = "Enter your school name."
    if (!selectedDistrict || !districts?.includes(selectedDistrict)) {
      nextFieldErrors.city = "Select a valid Bangladesh district."
    }
    if (!formData.class) nextFieldErrors.class = "Select your class."
    if (!formData.academicGroup) nextFieldErrors.academicGroup = "Select your academic group."
    if (!formData.curriculumVersion) nextFieldErrors.curriculumVersion = "Select your curriculum version."
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return
    if (!selectedDistrict || !formData.academicGroup || !formData.curriculumVersion) return

    setSubmittedEmail(normalizedEmail)
    setFormData((current) => ({ ...current, email: normalizedEmail }))
    setError(null)
    setSuccess(null)
    setDeliveryUncertain(false)
    setIsLoading(true)

    try {
      const response = await register({
        email: normalizedEmail,
        password: formData.password,
        fullName: formData.name,
        school: formData.school,
        city: selectedDistrict,
        studentClass: Number.parseInt(formData.class, 10),
        academicGroup: formData.academicGroup,
        curriculumVersion: formData.curriculumVersion,
      })
      if (response.status === 202) {
        setSuccess(response.data.message)
        setFormData((current) => ({ ...current, password: "", confirmPassword: "" }))
        return
      }
      if (response.status !== 201) {
        throw new Error("We couldn't confirm that your account was created. Please try again.")
      }
      setRegistrationComplete(true)
      setFormData((current) => ({ ...current, password: "", confirmPassword: "" }))
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        err.status === 400 &&
        err.message === "City must be a valid Bangladesh district"
      ) {
        setFormData((current) => ({ ...current, city: "" }))
        setFieldErrors((current) => ({ ...current, city: err.message }))
        setDistrictOpen(false)
        try {
          const refreshedDistricts = await retryDistricts()
          if (refreshedDistricts) setDistrictOpen(true)
        } catch {
          // The hook exposes the retry failure alongside the district control.
        }
        return
      }
      const uncertain = isUncertainSignupDeliveryError(err)
      setDeliveryUncertain(uncertain)
      setError(
        uncertain
          ? "We couldn't confirm whether your verification email was sent. You can safely request another verification email."
          : formatApiError(err)
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(19,117,201,0.06),rgba(255,255,255,0))] px-4 py-12">
        <Card className="w-full max-w-md border-border/80 shadow-xl shadow-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl" role="heading" aria-level={1}>Create an account</CardTitle>
            <CardDescription>Start focused SSC practice</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationComplete ? (
              <div className="space-y-5 text-center">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700" role="status" aria-live="polite">
                  <MailCheck className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
                  <p className="mt-2 leading-6">
                    We sent a verification link to <span className="font-medium">{submittedEmail}</span>. Click the link to verify your account before signing in.
                  </p>
                </div>
                <Button asChild className="w-full rounded-lg">
                  <Link href={`/resend-verification?email=${encodeURIComponent(submittedEmail)}`}>
                    Resend verification email
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-lg bg-transparent">
                  <Link href={`/login?email=${encodeURIComponent(submittedEmail)}`}>Go to login</Link>
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {success && (
                <Alert variant="success" role="status">
                  <MailCheck aria-hidden="true" />
                  <AlertTitle>Request received</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {deliveryUncertain && submittedEmail && (
                <Button asChild variant="outline" className="w-full rounded-lg bg-transparent">
                  <Link href={`/resend-verification?email=${encodeURIComponent(submittedEmail)}`}>
                    Resend verification email
                  </Link>
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setFieldErrors((current) => ({ ...current, name: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.name && <p id="signup-name-error" className="text-sm text-destructive">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setFieldErrors((current) => ({ ...current, email: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && <p id="signup-email-error" className="text-sm text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setFieldErrors((current) => ({
                      ...current,
                      password: undefined,
                      confirmPassword: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "signup-password-requirements signup-password-error" : "signup-password-requirements"}
                  required
                  disabled={isLoading}
                />
                <p id="signup-password-requirements" className="text-xs text-muted-foreground">
                  Use at least 8 characters, including uppercase, lowercase, and a number.
                </p>
                {fieldErrors.password && <p id="signup-password-error" className="text-sm text-destructive">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    setFieldErrors((current) => ({ ...current, confirmPassword: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.confirmPassword && (
                  <p id="signup-confirm-password-error" className="text-sm text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School Name</Label>
                <Input
                  id="school"
                  type="text"
                  name="organization"
                  autoComplete="organization"
                  placeholder="Your school name"
                  value={formData.school}
                  onChange={(e) => {
                    setFormData({ ...formData, school: e.target.value })
                    setFieldErrors((current) => ({ ...current, school: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.school)}
                  aria-describedby={fieldErrors.school ? "signup-school-error" : undefined}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.school && <p id="signup-school-error" className="text-sm text-destructive">{fieldErrors.school}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">District</Label>
                  <DistrictCombobox
                    id="city"
                    value={formData.city}
                    districts={districts ?? []}
                    open={districtOpen}
                    onOpenChange={setDistrictOpen}
                    onValueChange={(value) => {
                      setFormData((current) => ({ ...current, city: value }))
                      setFieldErrors((current) => ({ ...current, city: undefined }))
                    }}
                    invalid={Boolean(fieldErrors.city)}
                    describedBy={[
                      fieldErrors.city ? "signup-city-error" : "",
                      districtsLoading || districtsValidating ? "signup-district-loading" : "",
                      districtsError ? "signup-district-load-error" : "",
                    ].filter(Boolean).join(" ") || undefined}
                    disabled={
                      isLoading ||
                      districtsLoading ||
                      districtsValidating ||
                      Boolean(districtsError) ||
                      !districts
                    }
                  />
                  {(districtsLoading || districtsValidating) && (
                    <p
                      id="signup-district-loading"
                      className="text-sm text-muted-foreground"
                      role="status"
                    >
                      {districtsValidating && !districtsLoading
                        ? "Refreshing districts..."
                        : "Loading districts..."}
                    </p>
                  )}
                  {districtsError && !districtsValidating && (
                    <div
                      id="signup-district-load-error"
                      className="space-y-2 text-sm text-destructive"
                      role="alert"
                    >
                      <p>We couldn&apos;t load the district list. Check your connection and retry.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void retryDistricts()}
                      >
                        Retry districts
                      </Button>
                    </div>
                  )}
                  {fieldErrors.city && <p id="signup-city-error" className="text-sm text-destructive">{fieldErrors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => {
                      setFormData({ ...formData, class: value })
                      setFieldErrors((current) => ({ ...current, class: undefined }))
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="class" aria-invalid={Boolean(fieldErrors.class)} aria-describedby={fieldErrors.class ? "signup-class-error" : undefined}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.class && <p id="signup-class-error" className="text-sm text-destructive">{fieldErrors.class}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="academic-group">Academic Group</Label>
                  <Select
                    value={formData.academicGroup}
                    onValueChange={(value) => {
                      setFormData({ ...formData, academicGroup: value as AcademicGroup })
                      setFieldErrors((current) => ({ ...current, academicGroup: undefined }))
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="academic-group"
                      aria-invalid={Boolean(fieldErrors.academicGroup)}
                      aria-describedby={fieldErrors.academicGroup ? "signup-academic-group-error" : undefined}
                    >
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCIENCE">Science</SelectItem>
                      <SelectItem value="BUSINESS_STUDIES">Business Studies (Commerce)</SelectItem>
                      <SelectItem value="HUMANITIES">Humanities (Arts)</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.academicGroup && (
                    <p id="signup-academic-group-error" className="text-sm text-destructive">
                      {fieldErrors.academicGroup}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curriculum-version">Curriculum Version</Label>
                  <Select
                    value={formData.curriculumVersion}
                    onValueChange={(value) => {
                      setFormData({ ...formData, curriculumVersion: value as CurriculumVersion })
                      setFieldErrors((current) => ({ ...current, curriculumVersion: undefined }))
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="curriculum-version"
                      aria-invalid={Boolean(fieldErrors.curriculumVersion)}
                      aria-describedby={fieldErrors.curriculumVersion ? "signup-curriculum-version-error" : undefined}
                    >
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENGLISH">English Version</SelectItem>
                      <SelectItem value="BANGLA">Bangla Version</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.curriculumVersion && (
                    <p id="signup-curriculum-version-error" className="text-sm text-destructive">
                      {fieldErrors.curriculumVersion}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={
                  isLoading ||
                  districtsLoading ||
                  districtsValidating ||
                  Boolean(districtsError) ||
                  !districts
                }
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
