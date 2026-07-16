import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CircleCheck,
  CreditCard,
  LockKeyhole,
  MessageSquareText,
  NotebookTabs,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthAwareStartFreeButton } from "./auth-aware-start-free-button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = {
  title: "How SSC Practice Works | Shikkha Buddy",
  description: "See how Shikkha Buddy helps SSC students choose a subject, practice MCQs, and plan their next revision.",
  openGraph: {
    title: "How SSC Practice Works | Shikkha Buddy",
    description: "See how Shikkha Buddy helps SSC students choose a subject, practice MCQs, and plan their next revision.",
  },
  twitter: {
    card: "summary",
    title: "How SSC Practice Works | Shikkha Buddy",
    description: "See how Shikkha Buddy helps SSC students choose a subject, practice MCQs, and plan their next revision.",
  },
}

const journeySteps: Array<{
  number: number
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    number: 1,
    title: "Choose subject",
    description: "Pick the subject and topic you want to practice.",
    icon: BookOpen,
  },
  {
    number: 2,
    title: "Choose chapter",
    description: "Select a chapter for the session.",
    icon: NotebookTabs,
  },
  {
    number: 3,
    title: "Practice MCQs",
    description: "Answer focused questions based on exam-style patterns.",
    icon: Target,
  },
  {
    number: 4,
    title: "Review mistakes",
    description: "Use explanations to plan the next revision.",
    icon: CircleCheck,
  },
]

const sessionSteps: Array<{
  number: number
  title: string
  description: string
  icon: LucideIcon
  iconClass: string
}> = [
  {
    number: 1,
    title: "Answer first",
    description: "Choose one option and keep moving.",
    icon: NotebookTabs,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    number: 2,
    title: "Read the explanation",
    description: "See why the answer is right or wrong.",
    icon: MessageSquareText,
    iconClass: "bg-emerald-500/10 text-emerald-700",
  },
  {
    number: 3,
    title: "Mark what to review",
    description: "Use mistakes to decide your next chapter.",
    icon: Bookmark,
    iconClass: "bg-orange-500/10 text-orange-600",
  },
]

const availabilityRows = [
  { type: "MCQ Practice", status: "Available now", bestFor: "Focused chapter revision", tone: "available" },
  { type: "CQ Practice", status: "Coming soon", bestFor: "Full creative-question practice", tone: "coming" },
  { type: "Mixed Practice", status: "Coming soon", bestFor: "MCQ + CQ practice sets", tone: "coming" },
  { type: "Board-only sets", status: "Pro", bestFor: "Stricter exam revision", tone: "pro" },
] as const

const reviewPoints = ["See correct answers", "Review missed questions", "Practice again by chapter"]

export default function HowItWorksPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.07),rgba(255,255,255,0)_78%)]">
        <div className="container mx-auto px-4 py-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="border-transparent bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              Simple SSC practice flow
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              How SSC practice works on Shikkha Buddy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Pick a subject, choose a chapter, answer focused MCQs, and review what to revise next.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <AuthAwareStartFreeButton className="h-11 rounded-lg px-8 text-base shadow-primary" />
              <Button variant="outline" className="h-11 rounded-lg border-primary px-8 text-base text-primary hover:bg-primary/5" asChild>
                <Link href="/subjects">Choose a subject</Link>
              </Button>
            </div>
            <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-0">
              <TrustPoint icon={CircleCheck} text="MCQ available now" />
              <TrustPoint icon={ShieldCheck} text="Chapter-wise practice" className="sm:border-x sm:border-border" />
              <TrustPoint icon={CreditCard} text="No credit card" />
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12 lg:px-14">
        <div className="rounded-xl border border-border bg-card px-4 py-7 shadow-sm sm:px-7 sm:py-8">
          <SectionHeading
            title="From topic to revision"
            description="Four simple steps from choosing a topic to knowing what to review next."
          />
          <ol className="mt-8 grid gap-8 md:grid-cols-4 md:gap-0">
            {journeySteps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === journeySteps.length - 1

              return (
                <li key={step.number} className="relative px-3 text-center">
                  {!isLast && (
                    <ArrowRight
                      className="absolute right-[-14px] top-12 hidden h-5 w-5 text-primary/60 md:block"
                      aria-hidden="true"
                    />
                  )}
                  <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {step.number}
                  </span>
                  <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-40 text-xs leading-5 text-muted-foreground">{step.description}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-4 sm:py-8 lg:px-14" aria-labelledby="mcq-session-heading">
        <SectionHeading title="What happens during an MCQ session" />
        <div className="mt-5 grid gap-5 md:grid-cols-[1.02fr_0.98fr]">
          <QuestionPreview />
          <ol className="relative space-y-4">
            <div className="absolute bottom-8 left-6 top-8 hidden border-l border-dashed border-primary/40 sm:block" aria-hidden="true" />
            {sessionSteps.map((step) => {
              const Icon = step.icon

              return (
                <li key={step.number} className="relative flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {step.number}
                  </span>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${step.iconClass}`}>
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12 lg:px-14" aria-labelledby="availability-heading">
        <SectionHeading title="What is available now" />
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableCaption className="sr-only">Current Shikkha Buddy practice availability for the SSC beta.</TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Practice type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Best for</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availabilityRows.map((row) => (
                <TableRow key={row.type}>
                  <TableCell className="font-medium text-foreground">{row.type}</TableCell>
                  <TableCell><AvailabilityStatus tone={row.tone} label={row.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{row.bestFor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="container mx-auto px-4 py-4 sm:py-8 lg:px-14" aria-labelledby="after-practice-heading">
        <SectionHeading title="After practice" />
        <div className="mt-5 grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm md:grid-cols-[0.9fr_1.1fr] md:p-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Turn answers into the next revision step</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              After each session, review missed questions, read explanations, and choose the next chapter with more confidence.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {reviewPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <aside className="rounded-lg border border-border bg-background p-4" aria-labelledby="session-review-heading">
            <h3 id="session-review-heading" className="text-sm font-bold text-foreground">Session review</h3>
            <dl className="mt-3 overflow-hidden rounded-lg border border-border text-sm">
              <ReviewRow label="MCQs answered" value="10" />
              <ReviewRow label="Needs review" value="2" />
              <ReviewRow label="Next step" value="Revise Light" highlight />
            </dl>
          </aside>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12 lg:px-14">
        <div className="grid items-center gap-5 rounded-xl border border-primary/15 bg-primary/5 px-5 py-6 sm:grid-cols-[150px_1fr] sm:px-8">
          <BookIllustration />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">Try the flow in a free MCQ session</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Start with one subject and one chapter. You can upgrade later only if board-only sets and pro tools help you revise.
            </p>
            <AuthAwareStartFreeButton className="mt-4 h-11 rounded-lg px-6 shadow-primary" />
            <p className="mt-2 text-xs text-muted-foreground">No credit card required.</p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function TrustPoint({ icon: Icon, text, className = "" }: { icon: LucideIcon; text: string; className?: string }) {
  return (
    <li className={`flex items-center justify-center gap-2 px-3 ${className}`}>
      <Icon className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
      <span>{text}</span>
    </li>
  )
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

function QuestionPreview() {
  const options = ["Reflection", "Refraction", "Dispersion", "Diffusion"]

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="mcq-example-heading">
      <h3 id="mcq-example-heading" className="text-base font-bold text-foreground">MCQ session example</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">Physics - Light</Badge>
        <Badge className="border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">MCQ</Badge>
      </div>
      <p className="mt-4 text-sm font-medium leading-6 text-foreground">
        A ray of light bends when it enters water because its speed changes. What is this called?
      </p>
      <ol className="mt-4 space-y-2" aria-label="Example answer options">
        {options.map((option, index) => {
          const isCorrect = index === 1
          const letter = String.fromCharCode(65 + index)

          return (
            <li
              key={option}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-border text-muted-foreground"
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCorrect ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}>
                {letter}
              </span>
              <span>{option}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700">
        <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        Correct. Review: Refraction
      </p>
    </article>
  )
}

function AvailabilityStatus({ tone, label }: { tone: (typeof availabilityRows)[number]["tone"]; label: string }) {
  if (tone === "available") {
    return <Badge className="border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">{label}</Badge>
  }

  if (tone === "pro") {
    return (
      <Badge asChild className="border-transparent bg-orange-500/10 text-orange-600 hover:bg-orange-500/10">
        <Link href="/pricing" aria-label="Board-only sets, Pro option, opens pricing">{label}</Link>
      </Badge>
    )
  }

  return (
    <Badge className="border-transparent bg-muted text-muted-foreground hover:bg-muted">
      <LockKeyhole className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}

function ReviewRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={highlight ? "font-semibold text-primary" : "font-semibold text-foreground"}>{value}</dd>
    </div>
  )
}

function BookIllustration() {
  return (
    <div className="relative mx-auto flex h-24 w-32 items-end justify-center text-primary" aria-hidden="true">
      <Sparkles className="absolute left-2 top-0 h-4 w-4 text-primary/50" />
      <Sparkles className="absolute right-2 top-5 h-3 w-3 text-primary/40" />
      <div className="absolute bottom-2 h-7 w-24 rounded-[50%] bg-primary/10 blur-sm" />
      <div className="relative flex h-16 w-24 items-end justify-center rounded-b-xl border border-primary/30 bg-background shadow-sm">
        <BookOpen className="mb-3 h-12 w-12 text-primary" strokeWidth={1.8} />
      </div>
    </div>
  )
}
