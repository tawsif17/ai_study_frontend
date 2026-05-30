import { PageShell } from "@/components/page-shell"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap } from "@/components/icons"
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button"
import Link from "next/link"
import { Suspense } from "react"

const freePlan = {
  name: "Free",
  price: "0",
  description: "Start with limited MCQ practice.",
  features: [
    "Daily limited questions (10-15 per day)",
    "MCQ practice only",
    "Basic explanations",
    "1 subject access",
    "Progress saved automatically",
  ],
  cta: "Start Free",
  helperText: "No credit card required.",
}

const proPlan = {
  name: "Pro",
  price: "499",
  period: " / month",
  badge: "Most popular",
  description: "More practice access for students who want broader revision.",
  features: [
    "Unlimited questions",
    "MCQ, CQ & Mixed Mode",
    "Detailed explanations",
    "All available subjects",
    "Weak area analysis (coming soon)",
    "Progress tracking (coming soon)",
    "Mixed practice sessions",
    "Bookmark & revision mode (coming soon)",
    "Faster question generation (coming soon)",
  ],
}

function UpgradeToProButtonFallback() {
  return (
    <>
      <Button className="w-full" disabled>
        Upgrade to Pro
      </Button>
      <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">
        Upgrade uses the account flow available in this release.
      </p>
    </>
  )
}

export function PricingContent() {
  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0))]">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 md:mb-6">
              <Breadcrumb items={[{ label: "Pricing" }]} />
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Plans</p>
              <h1 className="mb-3 text-3xl font-bold text-foreground text-balance md:mb-4 md:text-4xl lg:text-5xl">
                Simple pricing for focused SSC practice
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
                Start free. Upgrade when you&apos;re ready to go further.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
          <Card className="relative flex flex-col border-border/80 shadow-sm">
            <CardHeader className="text-center pb-3 md:pb-4">
              <div className="mx-auto mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-muted">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg md:text-xl">{freePlan.name}</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">{freePlan.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-4 md:mb-6">
                <span className="text-3xl md:text-4xl font-bold text-foreground">Tk {freePlan.price}</span>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                {freePlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-lg border-primary/20 bg-transparent" variant="outline" asChild>
                <Link href="/subjects">{freePlan.cta}</Link>
              </Button>
              <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">{freePlan.helperText}</p>
            </CardContent>
          </Card>

          <Card className="relative flex flex-col border-primary shadow-xl shadow-primary/10 md:scale-[1.03]">
            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-xs md:-top-3">
              {proPlan.badge}
            </Badge>
            <CardHeader className="text-center pb-3 md:pb-4 pt-6">
              <div className="mx-auto mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">{proPlan.name}</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">{proPlan.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-4 md:mb-6">
                <span className="text-3xl md:text-4xl font-bold text-foreground">Tk {proPlan.price}</span>
                <span className="text-sm md:text-base text-muted-foreground">{proPlan.period}</span>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                {proPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Suspense fallback={<UpgradeToProButtonFallback />}>
                <UpgradeToProButton />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">Have questions?</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We&apos;re here to help you choose the right plan for your learning journey.
            </p>
            <Button variant="outline" className="rounded-lg border-primary/20 bg-background" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
