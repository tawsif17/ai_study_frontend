"use client"

import { useEffect, useState } from "react"
import { PageShell } from "@/components/page-shell"
import { submitContact } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type SubmitStatus = "idle" | "loading" | "success" | "error"

export default function ContactPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [feedback, setFeedback] = useState("")

  const isValid =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.message.trim().length > 0
  const isIdentityLocked = Boolean(user)

  useEffect(() => {
    if (!user) {
      return
    }

    setFormData((current) => ({
      ...current,
      name: current.name.trim() ? current.name : user.full_name ?? "",
      email: current.email.trim() ? current.email : user.email ?? "",
    }))
  }, [user])

  const handleChange = (field: "name" | "email" | "message", value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isValid) {
      return
    }

    setStatus("loading")
    setFeedback("")

    try {
      const response = await submitContact(formData)
      setStatus("success")
      setFeedback(response.message)
      setFormData({
        name: "",
        email: "",
        message: "",
      })
    } catch (error) {
      setStatus("error")
      setFeedback(formatApiError(error))
    }
  }

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Contact us</CardTitle>
            <CardDescription>Send a message and we will get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {feedback || "Something went wrong. Please try again."}
                </div>
              )}

              {status === "success" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={status === "loading"}
                  readOnly={isIdentityLocked}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={status === "loading"}
                  readOnly={isIdentityLocked}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help?"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={status === "loading"}
                  required
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === "loading" || !isValid}>
                {status === "loading" ? "Sending..." : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
