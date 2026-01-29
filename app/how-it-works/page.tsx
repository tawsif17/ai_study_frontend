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

export const metadata = {
  title: "How It Works | Shikkha Buddy",
  description: "A simple, step-by-step practice flow designed to build confidence — not pressure.",
}

const steps = [
  {
    number: 1,
    title: "Choose what you want to practice",
    description: "Select your subject, chapter, or the full syllabus. Start small or practice everything.",
    icon: BookOpen,
  },
  {
    number: 2,
    title: "Practice real and AI-generated questions",
    description: "Solve a mix of real board questions and new AI-generated questions based on the same exam patterns.",
    icon: Sparkles,
  },
  {
    number: 3,
    title: "Understand every answer clearly",
    description: "Get instant explanations with textbook-based references — even when your answer is wrong.",
    icon: Lightbulb,
  },
  {
    number: 4,
    title: "Identify weak topics automatically",
    description:
      "We highlight the specific topics within each chapter that need more attention — not just the chapter name.",
    icon: Target,
  },
  {
    number: 5,
    title: "Practice more where you need it most",
    description: "Future practice sessions include more MCQs and CQs from your weak areas to help you improve faster.",
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
    description: "Real exam-style practice combining both.",
    recommended: true,
  },
]

const feedbackPoints = [
  "See which questions you struggled with and why",
  "View weak topics inside each chapter",
  "Get better-focused questions in your next practice",
]

const trustPoints = [
  "Based on real board questions and exam patterns",
  "Designed to reduce exam stress",
  "Works at your pace — pause anytime",
  "Start free, upgrade only if it helps you",
]

export default function HowItWorksPage() {
  return (
    <PageShell>
      {/* Hero Section */}
      <section id="how-it-works" className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 md:mb-6">
              <Breadcrumb items={[{ label: "How It Works" }]} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 text-balance">
                How Shikkha Buddy helps you learn
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty mb-2">
                A simple, step-by-step practice flow designed to build confidence — not pressure.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground/70">No complicated setup. No guesswork.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step Flow Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
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
                    <div className="relative z-10 flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm md:text-base">
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
      <section className="bg-muted/30 border-y border-border">
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
                    className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold text-foreground">{mode.title}</h3>
                        {mode.recommended && (
                          <span className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
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
            You don't just get a score — you get direction
          </h2>
          <Card className="border-border">
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
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-2 md:space-y-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 md:gap-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-success shrink-0" />
                  <span className="text-sm md:text-base text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
            Ready to try your first practice session?
          </h2>
          <Button size="lg" className="gap-2 w-full sm:w-auto" asChild>
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
