import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, Headphones, Lightbulb, ShieldCheck, Sparkles } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Page not found | Shikkha Buddy",
  description: "The requested Shikkha Buddy page could not be found.",
}

const destinations = [
  {
    title: "Practice",
    description: "Choose a subject and continue with available MCQs.",
    href: "/subjects",
    icon: BookOpen,
  },
  {
    title: "How it works",
    description: "See the simple SSC practice flow.",
    href: "/how-it-works",
    icon: Lightbulb,
  },
  {
    title: "Contact support",
    description: "Get help if you reached this page unexpectedly.",
    href: "/contact",
    icon: Headphones,
  },
]

function LearningIllustration() {
  return (
    <div className="relative mx-auto h-36 w-full max-w-80 sm:h-48" aria-hidden="true">
      <div className="absolute inset-x-8 bottom-1 h-5 rounded-[50%] bg-primary/10 blur-md" />
      <Sparkles className="absolute left-[8%] top-[28%] h-5 w-5 text-primary/55" strokeWidth={1.6} />
      <Sparkles className="absolute right-[10%] top-[5%] h-4 w-4 text-primary/45" strokeWidth={1.6} />
      <svg className="absolute inset-0 h-full w-full text-primary" viewBox="0 0 360 210" fill="none">
        <path d="M180 184c-34-28-75-39-126-28L66 62c46-8 83 2 114 29v93Z" fill="white" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M180 184c34-28 75-39 126-28L294 62c-46-8-83 2-114 29v93Z" fill="white" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="m54 156-8 15c55-7 98 0 134 20 36-20 79-27 134-20l-8-15" fill="#eaf4ff" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M180 184v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M78 84c35-4 65 4 88 22M75 105c37-4 67 3 91 21M72 126c38-4 69 3 94 20" stroke="#b7d8f5" strokeWidth="2" strokeLinecap="round" />
        <path d="M282 84c-35-4-65 4-88 22M285 105c-37-4-67 3-91 21M288 126c-38-4-69 3-94 20" stroke="#b7d8f5" strokeWidth="2" strokeLinecap="round" />
        <path d="M129 56c17-20 34-20 51 0 17-20 34-20 51 0" stroke="#85bdf0" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" />
        <circle cx="295" cy="164" r="31" fill="white" stroke="currentColor" strokeWidth="3" />
        <path d="m281 170 25-18-12 28-4-11-9 1Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function NotFoundPage() {
  return (
    <PageShell mainClassName="bg-secondary/45">
      <section className="px-4 py-8 sm:py-12 lg:py-16" aria-labelledby="not-found-title">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/15 bg-card px-5 py-8 text-center shadow-lg sm:px-10 sm:py-12 lg:px-16">
          <Badge variant="outline" className="border-primary/25 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Page not found
          </Badge>

          <h1 id="not-found-title" className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            This page took a wrong turn.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            The page you&apos;re looking for may have moved or no longer exists.
          </p>

          <div className="mt-5 sm:mt-7">
            <LearningIllustration />
          </div>

          <div className="mx-auto mt-6 grid max-w-md gap-3">
            <Button size="lg" className="min-h-11 rounded-lg text-base shadow-primary" asChild>
              <Link href="/subjects">Choose a subject</Link>
            </Button>
            <Button size="lg" variant="outline" className="min-h-11 rounded-lg border-primary text-base text-primary hover:bg-primary/5 hover:text-primary" asChild>
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            Your progress and account are safe.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12 pt-2 sm:pb-16 sm:pt-4 lg:pb-20" aria-labelledby="destinations-title">
        <div className="mx-auto max-w-6xl">
          <h2 id="destinations-title" className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Where would you like to go?
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {destinations.map((destination) => {
              const Icon = destination.icon

              return (
                <Link key={destination.href} href={destination.href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Card className="h-full min-h-52 gap-4 border-primary/10 p-5 transition-colors group-hover:border-primary/30 sm:p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{destination.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{destination.description}</p>
                    </div>
                    <ArrowRight className="mt-auto ml-auto h-5 w-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
