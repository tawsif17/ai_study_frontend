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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Practice Mode</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a format that fits the topic and your study goal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">SSC Science Subjects</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Focused practice paths for the subjects currently available.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Practicing?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with a focused SSC science practice flow and build consistency over time.
          </p>
          <AuthGatedLink
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            href="/subjects"
          >
            Get Started Free
          </AuthGatedLink>
        </div>
      </section>
    </PageShell>
  )
}
