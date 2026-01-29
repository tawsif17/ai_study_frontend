import { PageShell } from "@/components/page-shell"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ModeCard } from "@/components/mode-card"
import { SubjectCard } from "@/components/subject-card"
import { CheckCircle, FileText, Shuffle, Calculator, Atom, FlaskConical } from "@/components/icons"
import Link from "next/link"

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
              Different ways to practice based on what works best for you.
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
              description="Real exam experience combining MCQ + CQ — just like the actual SSC board exam."
              href="/subjects"
            />
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Subjects We Cover</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive coverage for all your SSC science subjects.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SubjectCard
              icon={Calculator}
              title="Higher Math"
              description="Algebra, Geometry, Trigonometry, Statistics and more — with solved examples and practice problems."
              color="bg-blue-500"
              slug="higher-math"
            />
            <SubjectCard
              icon={Atom}
              title="Physics"
              description="Mechanics, Light, Sound, Electricity and Magnetism — visual explanations and numerical practice."
              color="bg-teal-500"
              slug="physics"
            />
            <SubjectCard
              icon={FlaskConical}
              title="Chemistry"
              description="Organic, Inorganic and Physical Chemistry — reactions, formulas and conceptual clarity."
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
            Join thousands of SSC students who are already improving their scores with Shikkha Buddy.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
