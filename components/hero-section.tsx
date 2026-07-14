import Link from "next/link"
import { AuthGatedLink } from "@/components/auth-gated-link"
import { ArrowRight, BookOpen, CheckCircle, CheckCircle2 } from "@/components/icons"
import { Button } from "@/components/ui/button"

const answerOptions = [
  { label: "A", text: "Reflection" },
  { label: "B", text: "Refraction", correct: true },
  { label: "C", text: "Dispersion" },
  { label: "D", text: "Diffusion" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_85%_8%,rgba(19,117,201,0.10),transparent_28%),linear-gradient(180deg,rgba(19,117,201,0.05),rgba(255,255,255,0)_62%)] py-10 sm:py-14 lg:py-16">
      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <div className="mb-6 inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            SSC MCQ practice available now
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Practice smarter for SSC exams
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0">
            Answer focused SSC exam MCQs, review mistakes, and keep your next revision step clear.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" className="h-14 rounded-lg px-9 text-base shadow-primary" asChild>
              <AuthGatedLink href="/subjects">Start free</AuthGatedLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-lg border-primary bg-background px-9 text-base font-semibold text-primary hover:bg-primary/5"
              asChild
            >
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <div className="mt-11 grid gap-4 text-left text-xs font-medium text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 shrink-0 text-[#12b76a]" aria-hidden="true" />
              <span>MCQ available now</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <span>Past paper questions mixed in</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-[#6d5dfc] text-[#6d5dfc]"
                aria-hidden="true"
              >
                <span className="h-2.5 w-3.5 rounded-sm border border-current" />
              </span>
              <span>No credit card</span>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <h2 className="text-base font-bold text-foreground">MCQ practice preview</h2>
              <div className="flex items-center gap-5 text-sm font-semibold text-muted-foreground">
                <span>3 / 10</span>
                <span className="flex flex-col gap-1" aria-hidden="true">
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                Physics - Light
              </span>
              <span className="rounded-lg bg-[#dcfae6] px-3 py-1.5 text-sm font-semibold text-[#079455]">
                Board-style MCQ
              </span>
            </div>

            <p className="mt-5 text-base font-semibold leading-7 text-foreground">
              A ray of light bends when it enters water because its speed changes. What is this called?
            </p>

            <div className="mt-5 space-y-3" aria-label="Static MCQ answer preview">
              {answerOptions.map((option) => (
                <div
                  key={option.label}
                  className={
                    option.correct
                      ? "flex items-center gap-4 rounded-lg border border-[#84e0a5] bg-[#ecfdf3] px-4 py-3 text-[#079455]"
                      : "flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-3 text-muted-foreground"
                  }
                >
                  <span
                    className={
                      option.correct
                        ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#12b76a] text-sm font-bold text-white"
                        : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground"
                    }
                  >
                    {option.label}
                  </span>
                  <span className="text-sm font-semibold">{option.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#84e0a5] bg-[#ecfdf3] px-4 py-4 text-sm font-semibold text-[#079455]">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Correct. Review: Refraction</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Bookmark
              </span>
              <Link href="/subjects" className="inline-flex items-center gap-2 text-primary hover:underline">
                Try 5 more MCQs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
