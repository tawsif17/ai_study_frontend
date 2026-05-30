import type { Metadata } from "next"
import { PageShell } from "@/components/page-shell"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ModeCard } from "@/components/mode-card"
import { SubjectCard } from "@/components/subject-card"
import { CheckCircle, FileText, Shuffle, Calculator, Atom, FlaskConical } from "@/components/icons"
import { AuthGatedLink } from "@/components/auth-gated-link"

export const metadata: Metadata = {
  title: "SSC Science Practice | Shikkha Buddy",
  description:
    "Practice SSC Higher Math, Physics and Chemistry with guided MCQ, CQ, and mixed question sessions.",
  openGraph: {
    title: "SSC Science Practice | Shikkha Buddy",
    description:
      "Practice SSC Higher Math, Physics and Chemistry with guided MCQ, CQ, and mixed question sessions.",
  },
  twitter: {
    card: "summary",
    title: "SSC Science Practice | Shikkha Buddy",
    description:
      "Practice SSC Higher Math, Physics and Chemistry with guided MCQ, CQ, and mixed question sessions.",
  },
}

export default function HomePage() {
  return (
    <PageShell>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Practice Modes Section */}
      <section className="border-y border-border bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Practice modes</p>
            <h2 className="mb-3 text-2xl font-bold text-foreground text-balance md:text-3xl">
              Choose Your Practice Mode
            </h2>
            <p className="mx-auto leading-7 text-muted-foreground">
              Choose a format that fits the topic and your study goal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            <ModeCard
              icon={CheckCircle}
              title="MCQ Practice"
              description="Multiple choice questions with instant feedback to test your knowledge quickly."
              href="/subjects"
            />
            <ModeCard
              icon={FileText}
              title="CQ Practice"
              description="Creative questions with detailed explanations to develop deeper understanding."
              href="/subjects"
            />
            <ModeCard
              icon={Shuffle}
              title="Mixed Mode"
              description="Practice MCQ and CQ together when you want a broader review."
              href="/subjects"
            />
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Available subjects</p>
            <h2 className="mb-3 text-2xl font-bold text-foreground text-balance md:text-3xl">
              SSC Science Subjects
            </h2>
            <p className="mx-auto leading-7 text-muted-foreground">
              Focused practice paths for the subjects currently available.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            <SubjectCard
              icon={Calculator}
              title="Higher Math"
              description="Practice algebra, geometry, trigonometry, statistics, and related problem types."
              color="bg-blue-500"
              slug="higher-math"
            />
            <SubjectCard
              icon={Atom}
              title="Physics"
              description="Review mechanics, light, sound, electricity, and magnetism through targeted practice."
              color="bg-teal-500"
              slug="physics"
            />
            <SubjectCard
              icon={FlaskConical}
              title="Chemistry"
              description="Practice organic, inorganic, and physical chemistry topics with question-based review."
              color="bg-emerald-500"
              slug="chemistry"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background px-4 py-16 md:py-20">
        <div className="container mx-auto rounded-2xl border border-primary/15 bg-primary/5 px-6 py-10 text-center shadow-sm md:px-10 md:py-12">
          <h2 className="mb-3 text-2xl font-bold text-foreground text-balance md:text-3xl">
            Ready to Start Practicing?
          </h2>
          <p className="mx-auto mb-7 max-w-2xl leading-7 text-muted-foreground">
            Start with a focused SSC science practice flow and build consistency over time.
          </p>
          <AuthGatedLink
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground shadow-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/subjects"
          >
            Get Started Free
          </AuthGatedLink>
        </div>
      </section>
    </PageShell>
  )
}
