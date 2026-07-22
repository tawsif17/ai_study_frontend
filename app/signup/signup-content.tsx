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
import { formatApiError } from "@/lib/api/client"
import {
  isUncertainSignupDeliveryError,
  isValidVerificationEmail,
  normalizeVerificationEmail,
} from "@/lib/verification-form-recovery"

type SignupField = "name" | "email" | "password" | "school" | "city" | "class"
type SignupFieldErrors = Partial<Record<SignupField, string>>

export function SignupContent() {
  const { register } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [deliveryUncertain, setDeliveryUncertain] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    school: "",
    city: "",
    class: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = normalizeVerificationEmail(formData.email)
    const nextFieldErrors: SignupFieldErrors = {}
    if (!formData.name.trim()) nextFieldErrors.name = "Enter your full name."
    if (!isValidVerificationEmail(normalizedEmail)) nextFieldErrors.email = "Enter a valid email address."
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      nextFieldErrors.password = "Use at least 8 characters with uppercase, lowercase, and a number."
    }
    if (!formData.school.trim()) nextFieldErrors.school = "Enter your school name."
    if (!formData.city.trim()) nextFieldErrors.city = "Enter your city."
    if (!formData.class) nextFieldErrors.class = "Select your class."
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

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
        city: formData.city,
        studentClass: Number.parseInt(formData.class, 10),
      })
      if (response.status === 202) {
        setSuccess(response.data.message)
        setFormData((current) => ({ ...current, password: "" }))
        return
      }
      if (response.status !== 201) {
        throw new Error("We couldn't confirm that your account was created. Please try again.")
      }
      setRegistrationComplete(true)
      setFormData((current) => ({ ...current, password: "" }))
    } catch (err) {
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
            <CardDescription>Start focused SSC science practice</CardDescription>
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
                    setFieldErrors((current) => ({ ...current, password: undefined }))
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    name="address-level2"
                    autoComplete="address-level2"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value })
                      setFieldErrors((current) => ({ ...current, city: undefined }))
                    }}
                    aria-invalid={Boolean(fieldErrors.city)}
                    aria-describedby={fieldErrors.city ? "signup-city-error" : undefined}
                    required
                    disabled={isLoading}
                  />
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

              <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
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
