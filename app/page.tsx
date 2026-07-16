import type { Metadata } from "next"
import Link from "next/link"
import { AuthGatedLink } from "@/components/auth-gated-link"
import type { BetaSubjectKey } from "@/lib/beta-subjects"
import { FeaturesSection } from "@/components/features-section"
import { HeroSection } from "@/components/hero-section"
import {
  Atom,
  BookOpen,
  Calculator,
  CheckCircle,
  ChevronRight,
  FlaskConical,
  Target,
  Zap,
  type IconComponent,
} from "@/components/icons"
import { PageShell } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "SSC MCQ Practice | Shikkha Buddy",
  description:
    "Practice SSC exam MCQs for General Math, Physics, and Chemistry with answer explanations and mistake review.",
  openGraph: {
    title: "SSC MCQ Practice | Shikkha Buddy",
    description:
      "Practice SSC exam MCQs for General Math, Physics, and Chemistry with answer explanations and mistake review.",
  },
  twitter: {
    card: "summary",
    title: "SSC MCQ Practice | Shikkha Buddy",
    description:
      "Practice SSC exam MCQs for General Math, Physics, and Chemistry with answer explanations and mistake review.",
  },
}

const freePracticeBenefits = ["Topic-wise practice", "Answer explanations", "Mistake review"]

const subjects: Array<{
  key: BetaSubjectKey
  title: string
  description: string
  icon: IconComponent
  tone: string
}> = [
  {
    key: "general-math",
    title: "General Math",
    description: "Algebra, Geometry, Arithmetic, Mensuration",
    icon: Calculator,
    tone: "from-[#7c6df2] to-[#5266d8]",
  },
  {
    key: "physics",
    title: "Physics",
    description: "Light, Motion, Force, Electricity, Waves",
    icon: Atom,
    tone: "from-[#57c785] to-[#12964f]",
  },
  {
    key: "chemistry",
    title: "Chemistry",
    description: "Structure, Bonding, Reactions, Acids & Bases",
    icon: FlaskConical,
    tone: "from-[#ff9f43] to-[#f76707]",
  },
]

const steps: Array<{
  title: string
  description: string
  icon: IconComponent
}> = [
  {
    title: "Choose a subject",
    description: "Pick the subject and topic you want to practice.",
    icon: BookOpen,
  },
  {
    title: "Practice focused MCQs",
    description: "Answer MCQs shaped by board patterns and get instant feedback.",
    icon: Target,
  },
  {
    title: "Review and revise",
    description: "Check your mistakes and improve step by step.",
    icon: Zap,
  },
]

export default function HomePage() {
  return (
    <PageShell>
      <HeroSection />
      <FeaturesSection />
      <StartPracticingSection />
      <SubjectsSection />
      <HowItWorksSection />
      <FinalCtaSection />
    </PageShell>
  )
}

function StartPracticingSection() {
  return (
    <section className="bg-background py-8 md:py-12" aria-labelledby="start-practicing-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="start-practicing-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Start practicing
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Begin with free MCQ practice. Activate Beta Pro later for Board-only MCQ sets and Weak Area Analysis when you need more focused revision.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground md:text-3xl">Free MCQ practice</h3>
              <Badge className="border-transparent bg-[#dcfae6] text-[#079455] hover:bg-[#dcfae6]">
                Available now
              </Badge>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              AI-generated MCQs based on past board-question patterns, with past board questions mixed in.
            </p>

            <div className="my-7 border-t border-border" />

            <ul className="space-y-3">
              {freePracticeBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#12b76a]" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Button className="mt-8 h-14 w-full rounded-lg text-base shadow-primary" asChild>
              <AuthGatedLink href="/subjects">Start free practice</AuthGatedLink>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h3 className="text-base font-bold text-foreground">More practice options</h3>
            <div className="mt-5 space-y-4">
              <Link
                href="/pricing"
                className="group flex items-center justify-between gap-4 rounded-xl border border-[#ffd89a] bg-[#fffaf2] p-5 transition-colors hover:border-[#f79009] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Board-only MCQ sets, Pro option, opens pricing"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-bold text-foreground">Board-only MCQ sets</h4>
                    <Badge className="border-transparent bg-[#fff2cc] text-[#dc6803] hover:bg-[#fff2cc]">Pro</Badge>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Practise past board-question MCQ sets when you want stricter exam revision.
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>

              <DisabledPracticeOption
                title="CQ Practice"
                description="Full creative-question practice is planned."
              />
              <DisabledPracticeOption
                title="Mixed Practice"
                description="MCQ + CQ mixed sets are planned."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DisabledPracticeOption({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-5 text-muted-foreground"
      aria-disabled="true"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-base font-bold text-foreground">{title}</h4>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Coming soon
          </Badge>
        </div>
        <p className="mt-3 max-w-md text-sm leading-6">{description}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border" aria-hidden="true">
        <span className="relative h-4 w-4 rounded-sm border-2 border-current">
          <span className="absolute -left-0.5 -top-2 h-3 w-5 rounded-t-full border-2 border-b-0 border-current" />
        </span>
      </span>
    </div>
  )
}

function SubjectsSection() {
  return (
    <section className="bg-background py-10 md:py-14" aria-labelledby="subjects-heading">
      <div className="container mx-auto px-4">
        <h2 id="subjects-heading" className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Practice by subject
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectPreviewCard key={subject.title} subject={subject} />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          More SSC subjects will be added as practice content becomes ready.
        </p>
      </div>
    </section>
  )
}

function SubjectPreviewCard({ subject }: { subject: (typeof subjects)[number] }) {
  const Icon = subject.icon
  const destination = `/subjects?subject=${subject.key}`

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-5">
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${subject.tone}`}>
          <Icon className="h-10 w-10 text-white" aria-hidden="true" />
        </div>
        <div>
          <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">SSC</Badge>
          <h3 className="mt-3 text-lg font-bold text-foreground">{subject.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{subject.description}</p>
        </div>
      </div>

      <div className="my-6 border-t border-border" />

      <p className="flex items-center gap-3 text-sm text-muted-foreground">
        <CheckCircle className="h-5 w-5 shrink-0 text-[#12b76a]" aria-hidden="true" />
        MCQ practice available
      </p>

      <Button className="mt-6 h-13 w-full rounded-lg text-base shadow-primary" asChild>
        <AuthGatedLink href={destination}>Start Practice</AuthGatedLink>
      </Button>
    </article>
  )
}

function HowItWorksSection() {
  return (
    <section className="bg-background py-8 md:py-12" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <h2 id="how-it-works-heading" className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-7 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <li key={step.title} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-60 text-xs leading-6 text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="bg-background px-4 py-8 md:py-12">
      <div className="container mx-auto">
        <div className="grid items-center gap-6 rounded-2xl border border-primary/15 bg-primary/5 p-6 shadow-sm md:grid-cols-[0.28fr_1fr] md:p-8">
          <div className="mx-auto w-40 md:w-48" aria-hidden="true">
            <svg viewBox="0 0 180 120" className="h-auto w-full">
              <defs>
                <linearGradient id="bookCover" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="#e6f0ff" />
                  <stop offset="1" stopColor="#b9d6ff" />
                </linearGradient>
              </defs>
              <path d="M36 82c20-13 37-14 54-3v26c-18-10-35-10-54 1V82Z" fill="url(#bookCover)" stroke="#1375c9" strokeWidth="3" />
              <path d="M90 79c17-11 34-10 54 3v24c-19-11-36-11-54-1V79Z" fill="#eef6ff" stroke="#1375c9" strokeWidth="3" />
              <path d="M90 79v27" stroke="#1375c9" strokeLinecap="round" strokeWidth="3" />
              <path d="M47 89c11-5 22-6 33-2M100 87c12-4 23-3 34 3" stroke="#7aaef0" strokeLinecap="round" strokeWidth="3" />
              <path d="M38 50v-9M38 41h9M136 48v-8M136 40h8M70 32v-7M70 25h7" stroke="#9ec5ff" strokeLinecap="round" strokeWidth="3" />
              <circle cx="58" cy="45" r="3" fill="#9ec5ff" />
              <circle cx="122" cy="61" r="3" fill="#9ec5ff" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Start your first SSC practice session today
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Try free MCQ practice now. Activate Beta Pro later for Board-only MCQ sets and Weak Area Analysis when you want more focused revision.
            </p>
            <Button className="mt-5 h-11 w-full rounded-lg px-10 shadow-primary sm:w-auto" asChild>
              <AuthGatedLink href="/subjects">Start free</AuthGatedLink>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
