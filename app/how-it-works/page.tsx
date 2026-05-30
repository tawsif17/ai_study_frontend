import type { Metadata } from "next"
import { PageShell } from "@/components/page-shell"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  BookOpen,
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle,
  FileText,
  Shuffle,
  ArrowRight,
} from "@/components/icons"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How It Works | Shikkha Buddy",
  description:
    "See how Shikkha Buddy organizes SSC science practice into clear subject, question, and review steps.",
  openGraph: {
    title: "How It Works | Shikkha Buddy",
    description:
      "See how Shikkha Buddy organizes SSC science practice into clear subject, question, and review steps.",
  },
  twitter: {
    card: "summary",
    title: "How It Works | Shikkha Buddy",
    description:
      "See how Shikkha Buddy organizes SSC science practice into clear subject, question, and review steps.",
  },
}

const steps = [
  {
    number: 1,
    title: "Choose what you want to practice",
    description: "Select your subject, chapter, or the full syllabus. Start small or practice a wider set of topics.",
    icon: BookOpen,
  },
  {
    number: 2,
    title: "Practice guided questions",
    description: "Work through MCQ, CQ, or mixed practice based on the mode you choose.",
    icon: Sparkles,
  },
  {
    number: 3,
    title: "Review explanations clearly",
    description: "Use answer feedback and explanations to understand what to improve.",
    icon: Lightbulb,
  },
  {
    number: 4,
    title: "Notice patterns in your practice",
    description: "Use completed sessions to see where you may need more review.",
    icon: Target,
  },
  {
    number: 5,
    title: "Return to focused revision",
    description: "Use your results and recent practice to decide what to work on next.",
    icon: TrendingUp,
  },
]

const practiceModes = [
  {
    icon: CheckCircle,
    title: "MCQ Practice",
    description: "Quick questions with instant feedback.",
  },
  {
    icon: FileText,
    title: "CQ Practice",
    description: "Creative questions with detailed explanations.",
  },
  {
    icon: Shuffle,
    title: "Mixed Mode",
    description: "Practice MCQ and CQ together for broader review.",
    recommended: true,
  },
]

const feedbackPoints = [
  "Review submitted answers and explanations",
  "Spot topics that need more attention",
  "Choose the next practice session with more confidence",
]

const trustPoints = [
  "Built around SSC science practice needs",
  "Designed to reduce exam stress",
  "Works at your pace - pause anytime",
  "Start free, upgrade only if it helps you",
]

export default function HowItWorksPage() {
  return (
    <PageShell>
      {/* Hero Section */}
      <section id="how-it-works" className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0))]">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 md:mb-6">
              <Breadcrumb items={[{ label: "How It Works" }]} />
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Simple study flow</p>
              <h1 className="mb-3 text-3xl font-bold text-foreground text-balance md:mb-4 md:text-4xl lg:text-5xl">
                How Shikkha Buddy helps you practice
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty mb-2">
                A simple, step-by-step practice flow designed to build confidence without adding pressure.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground/70">No complicated setup. No guesswork.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step Flow Section */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-0">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1
              return (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute left-5 md:left-6 top-12 md:top-14 w-0.5 h-[calc(100%-2rem)] bg-border" />
                  )}
                  <div className="flex gap-3 md:gap-4 pb-6 md:pb-8">
                    {/* Step number circle */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-semibold text-primary-foreground shadow-primary md:h-12 md:w-12 md:text-base">
                      {step.number}
                    </div>
                    {/* Content */}
                    <div className="pt-1 md:pt-2">
                      <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">{step.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Practice Modes Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4 md:mb-6 text-center">
              Practice in the way that suits you
            </h2>
            <div className="space-y-2 md:space-y-3">
              {practiceModes.map((mode) => {
                const Icon = mode.icon
                return (
                  <div
                    key={mode.title}
                    className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-sm md:p-4"
                  >
                    <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold text-foreground">{mode.title}</h3>
                        {mode.recommended && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary md:text-xs">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{mode.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results & Feedback Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4 md:mb-6 text-center">
            Use each session to plan the next step
          </h2>
          <Card className="border-border/80 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <ul className="space-y-2 md:space-y-3">
                {feedbackPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 md:gap-3">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs md:text-sm text-muted-foreground/70 mt-4 text-center italic">
                Progress builds with consistency, not perfection.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust & Reassurance Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <ul className="grid gap-3 md:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-3 shadow-sm md:gap-3">
                  <Check className="h-4 w-4 shrink-0 text-success md:h-5 md:w-5" />
                  <span className="text-sm md:text-base text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-primary/15 bg-primary/5 px-6 py-8 text-center shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
            Ready to try your first practice session?
          </h2>
          <Button size="lg" className="h-11 w-full gap-2 rounded-lg shadow-primary sm:w-auto" asChild>
            <Link href="/subjects">
              Start practicing free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs md:text-sm text-muted-foreground mt-3">No credit card required.</p>
        </div>
      </section>
    </PageShell>
  )
}
