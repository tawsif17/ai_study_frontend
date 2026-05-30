import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, CheckCircle, FileText, Play, Target } from "@/components/icons"
import Link from "next/link"
import { AuthGatedLink } from "@/components/auth-gated-link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0)_68%)] py-12 sm:py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(19,117,201,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            SSC science practice for Bangladesh
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Practice smarter for SSC science.
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg lg:mx-0">
            Guided practice, explanations, and mock-style sessions for focused Higher Math, Physics, and Chemistry
            preparation.
          </p>
          <p className="mb-7 text-sm text-muted-foreground/80">
            Start free, choose a subject, and build revision sessions around what you need to practice next.
          </p>
          <div className="flex flex-col items-stretch gap-3 px-2 sm:flex-row sm:items-center sm:justify-center sm:px-0 lg:justify-start">
            <Button size="lg" className="h-11 gap-2 rounded-lg px-6 shadow-primary" asChild>
              <AuthGatedLink href="/subjects">
                Start practicing free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </AuthGatedLink>
            </Button>
            <Button size="lg" variant="outline" className="h-11 gap-2 rounded-lg border-primary/20 bg-background/80 px-6" asChild>
              <Link href="/how-it-works">
                <Play className="h-4 w-4" aria-hidden="true" />
                See how it works
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
            {["MCQ", "CQ", "Mixed practice"].map((item) => (
              <span key={item} className="rounded-full border border-border bg-background/80 px-3 py-1">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Today&apos;s focus</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">Physics: Light</h2>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">SSC</div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { icon: CheckCircle, title: "MCQ practice", text: "Quick concept checks" },
                  { icon: FileText, title: "CQ review", text: "Structured written practice" },
                  { icon: Target, title: "Mistake review", text: "Return to weak topics" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 rounded-lg bg-primary px-4 py-3 text-primary-foreground">
                <p className="text-sm font-semibold">Next step</p>
                <p className="mt-1 text-xs text-primary-foreground/85">
                  Choose a subject and start with a focused practice session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
