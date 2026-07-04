"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export function SignupContent() {
  const router = useRouter()
  const { register } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await register({
        email: formData.email,
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
      const params = new URLSearchParams({ registered: "true", email: formData.email })
      router.push(`/login?${params.toString()}`)
    } catch (err) {
      setError(formatApiError(err))
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
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School Name</Label>
                <Input
                  id="school"
                  type="text"
                  placeholder="Your school name"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData({ ...formData, class: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-lg" disabled={isLoading || !formData.class}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
