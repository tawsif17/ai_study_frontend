"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, CircleHelp, Info, LockKeyhole, UserRound } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { submitContact } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type SubmitStatus = "idle" | "loading" | "success" | "error"
type FormField = "name" | "email" | "message"
type FormData = Record<FormField, string>
type FieldErrors = Partial<Record<FormField, string>>

const initialFormData: FormData = { name: "", email: "", message: "" }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {}

  if (!formData.name.trim()) errors.name = "Name is required"
  if (!formData.email.trim()) {
    errors.email = "Email is required"
  } else if (!emailPattern.test(formData.email.trim())) {
    errors.email = "Invalid email address"
  }
  if (!formData.message.trim()) errors.message = "Message is required"

  return errors
}

function fieldForApiMessage(message: string): FormField | undefined {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("name")) return "name"
  if (normalizedMessage.includes("email")) return "email"
  if (normalizedMessage.includes("message")) return "message"
  return undefined
}

const helpLinks = [
  {
    href: "/faq",
    title: "Frequently asked questions",
    description: "Answers about subjects, practice, Beta Pro, and accounts.",
    action: "Read FAQs",
    icon: CircleHelp,
  },
  {
    href: "/support",
    title: "Support guide",
    description: "Help with using Shikkha Buddy and resolving common issues.",
    action: "Visit Support",
    icon: BookOpen,
  },
]

export function ContactContent() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [feedback, setFeedback] = useState("")

  const isIdentityLocked = Boolean(user)
  const signedInName = user?.full_name?.trim() || user?.email || "your account"

  useEffect(() => {
    if (!user) return

    setFormData({
      name: user.full_name ?? "",
      email: user.email ?? "",
      message: "",
    })
    setFieldErrors({})
  }, [user])

  const handleChange = (field: FormField, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      const remainingErrors = { ...current }
      delete remainingErrors[field]
      return remainingErrors
    })
    if (status !== "loading") {
      setStatus("idle")
      setFeedback("")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setStatus("error")
      setFeedback("Please correct the highlighted fields.")
      setFieldErrors(validationErrors)
      return
    }

    setStatus("loading")
    setFeedback("")
    setFieldErrors({})

    try {
      const response = await submitContact(formData)
      setStatus("success")
      setFeedback(response.message)
      setFormData(
        user
          ? { name: user.full_name ?? "", email: user.email ?? "", message: "" }
          : initialFormData
      )
    } catch (error) {
      const message = formatApiError(error)
      const field = fieldForApiMessage(message)

      setStatus("error")
      setFeedback(message)
      setFieldErrors(field ? { [field]: message } : {})
    }
  }

  const inputDescribedBy = (field: FormField) =>
    [isIdentityLocked ? "signed-in-identity-description" : undefined, fieldErrors[field] ? `${field}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <PageShell mainClassName="bg-background">
      <section className="px-4 pb-6 pt-8 text-center sm:pb-8 sm:pt-10 lg:pt-12">
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto mb-3 w-fit rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-medium text-primary">
            Contact
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get the right help
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
            Send a message, or check an existing help page for a quicker answer.
          </p>
        </div>
      </section>

      <section className="px-4 pb-8 sm:pb-10 lg:pb-12" aria-label="Contact options">
        <div className="mx-auto max-w-[1240px] rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-6 lg:p-8">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)] xl:gap-8">
            <aside className="px-1 py-1 sm:px-2 lg:pt-5" aria-labelledby="help-options-heading">
              <h2 id="help-options-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Start with the right place
              </h2>

              <div className="mt-6 space-y-4">
                {helpLinks.map(({ href, title, description, action, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-h-28 items-center gap-4 rounded-xl border border-primary/15 bg-background p-4 text-left shadow-[0_1px_3px_rgba(15,43,91,0.04)] transition-colors hover:border-primary/35 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary text-primary" aria-hidden="true">
                      <Icon className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-foreground">{title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex">
                      {action}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>

              <p className="mt-6 flex items-start gap-3 border-t border-primary/15 pt-6 text-sm leading-6 text-muted-foreground">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                Still need help? Send the details using the form.
              </p>
            </aside>

            <section className="rounded-xl border border-primary/15 bg-background p-5 shadow-[0_8px_24px_rgba(15,43,91,0.04)] sm:p-7" aria-labelledby="contact-form-heading">
              <h2 id="contact-form-heading" className="text-xl font-semibold text-foreground">
                Send a message
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">All fields are required.</p>

              {isIdentityLocked && (
                <div className="mt-5 flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.035] p-3.5" role="note">
                  <UserRound className="mt-0.5 size-7 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Signed in as {signedInName}</p>
                    <p id="signed-in-identity-description" className="mt-1 text-sm leading-5 text-muted-foreground">
                      Name and email are filled from your account.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="Contact form" className="mt-5 space-y-4">
                {status === "error" && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                    {feedback}
                  </div>
                )}

                {status === "success" && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status">
                    {feedback}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      disabled={status === "loading"}
                      readOnly={isIdentityLocked}
                      required
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={inputDescribedBy("name")}
                      className="min-h-11 pr-10"
                    />
                    {isIdentityLocked && <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />}
                  </div>
                  {fieldErrors.name && <p id="name-error" className="text-sm text-destructive">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      disabled={status === "loading"}
                      readOnly={isIdentityLocked}
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={inputDescribedBy("email")}
                      className="min-h-11 pr-10"
                    />
                    {isIdentityLocked && <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />}
                  </div>
                  {fieldErrors.email && <p id="email-error" className="text-sm text-destructive">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe what you need help with"
                    value={formData.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                    disabled={status === "loading"}
                    required
                    rows={4}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={inputDescribedBy("message")}
                    className="min-h-28 resize-y"
                  />
                  {fieldErrors.message && <p id="message-error" className="text-sm text-destructive">{fieldErrors.message}</p>}
                </div>

                <Button type="submit" className="min-h-11 w-full rounded-md" disabled={status === "loading"}>
                  {status === "loading" ? "Sending…" : "Send message"}
                </Button>
                <p className="text-sm leading-6 text-muted-foreground">
                  When you are signed in, your account is linked to the message.
                </p>
              </form>
            </section>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
