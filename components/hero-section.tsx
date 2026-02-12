import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "@/components/icons"
import Link from "next/link"
import { AuthGatedLink } from "@/components/auth-gated-link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-12 sm:py-20 md:py-32">
      {/* Background decoration - smaller on mobile */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
            Practice smarter. Learn deeper. Succeed confidently.
          </h1>
          <p className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl text-muted-foreground text-pretty px-2 sm:px-0">
            AI-powered practice, explanations, and mock tests — designed to adapt to how you learn.
          </p>
          <p className="mb-6 sm:mb-10 text-xs sm:text-sm text-muted-foreground/80 px-2 sm:px-0">
            Start with Physics, Chemistry, and Higher Math. Expanding to all major subjects and exams.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" className="gap-2 w-full sm:w-auto" asChild>
              <AuthGatedLink href="/subjects">
                Start practicing free
                <ArrowRight className="h-4 w-4" />
              </AuthGatedLink>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent w-full sm:w-auto" asChild>
              <Link href="/how-it-works">
                <Play className="h-4 w-4" />
                See how it works
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
