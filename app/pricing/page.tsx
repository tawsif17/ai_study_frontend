import { PageShell } from "@/components/page-shell"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap } from "@/components/icons"
import Link from "next/link"

export const metadata = {
  title: "Pricing | Shikkha Buddy",
  description: "Simple pricing for effective exam preparation. Start free, upgrade when ready.",
}

const freePlan = {
  name: "Free",
  price: "০",
  description: "Start learning with basic practice.",
  features: [
    "Daily limited questions (10–15 per day)",
    "MCQ practice only",
    "Basic AI explanations",
    "1 subject access",
    "Progress saved automatically",
  ],
  cta: "Start Free",
  helperText: "No credit card required.",
}

const proPlan = {
  name: "Pro",
  price: "৪৯৯",
  period: " / month",
  badge: "Most popular",
  description: "Everything you need to practice seriously and improve consistently.",
  features: [
    "Unlimited questions",
    "MCQ, CQ & Mixed Mode",
    "Detailed AI explanations",
    "All subjects access",
    "Weak area analysis",
    "Progress tracking",
    "Exam-style mock practice",
    "Bookmark & revision mode",
    "Faster question generation",
  ],
  cta: "Request Pro Upgrade",
  helperText: "In-app plan upgrade API is not available in current backend contracts.",
}

export default function PricingPage() {
  return (
    <PageShell>
      {/* Hero Section */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 md:mb-6">
              <Breadcrumb items={[{ label: "Pricing" }]} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 text-balance">
                Simple pricing for serious learners
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
                Start free. Upgrade when you're ready to go further.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative flex flex-col border-border">
            <CardHeader className="text-center pb-3 md:pb-4">
              <div className="mx-auto mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-muted">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg md:text-xl">{freePlan.name}</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">{freePlan.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-4 md:mb-6">
                <span className="text-3xl md:text-4xl font-bold text-foreground">৳{freePlan.price}</span>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                {freePlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/subjects">{freePlan.cta}</Link>
              </Button>
              <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">{freePlan.helperText}</p>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col border-primary shadow-lg md:scale-105">
            <Badge className="absolute -top-2.5 md:-top-3 left-1/2 -translate-x-1/2 bg-primary text-xs">
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
                <span className="text-3xl md:text-4xl font-bold text-foreground">৳{proPlan.price}</span>
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
              <Button className="w-full" asChild>
                <Link href="/?contact=upgrade">
                  {proPlan.cta}
                </Link>
              </Button>
              <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">{proPlan.helperText}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ or Info Block */}
      <section className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">Have questions?</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We're here to help you choose the right plan for your learning journey.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
