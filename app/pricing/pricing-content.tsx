import Link from "next/link"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Check, CheckCircle, Sparkles, Target, Zap } from "@/components/icons"
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button"

const subjects = "General Math, Physics & Chemistry"

const freeFeatures = [
  "Daily MCQ practice",
  subjects,
  "Answer explanations",
  "Results saved",
]

const betaProFeatures = [
  { label: "More MCQ practice" },
  { label: "Board-only MCQ sets", availability: "Coming soon" },
  { label: "Weak Area Analysis", availability: "Available now" },
  { label: subjects },
  { label: "Results and revision tools" },
]

const comparisonRows = [
  { feature: "Free MCQ practice", free: "Available now", betaPro: "Available now" },
  { feature: "Board-only MCQ sets", free: "Not included", betaPro: "Coming soon" },
  { feature: "Weak Area Analysis", free: "Not included", betaPro: "Available now" },
  { feature: "CQ & Mixed Practice", free: "Coming soon", betaPro: "Coming soon" },
  { feature: "No payment during beta", free: "Included", betaPro: "Included" },
]

function UpgradeToProButtonFallback() {
  return (
    <>
      <Button className="min-h-11 w-full" disabled>
        Loading beta access...
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Checking your beta access.</p>
    </>
  )
}

function AvailabilityBadge({ children }: { children: string }) {
  return (
    <Badge className="border-0 bg-success/10 px-2 py-1 text-success" variant="secondary">
      <CheckCircle aria-hidden="true" className="size-3" />
      {children}
    </Badge>
  )
}

function ComparisonValue({ value }: { value: string }) {
  if (value === "Available now") {
    return <AvailabilityBadge>{value}</AvailabilityBadge>
  }

  if (value === "Coming soon") {
    return <Badge className="border-0 bg-muted px-2 py-1 text-muted-foreground" variant="secondary">{value}</Badge>
  }

  if (value === "Not included") {
    return <span className="text-muted-foreground" aria-label="Not included">—</span>
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-success">
      <CheckCircle aria-hidden="true" className="size-4" />
      <span>{value}</span>
    </span>
  )
}

export function PricingContent() {
  return (
    <PageShell>
      <section className="bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0))]">
        <div className="container mx-auto px-4 pb-9 pt-9 md:pb-12 md:pt-12">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="border-0 bg-primary/10 px-3 py-1 text-primary" variant="secondary">Simple beta access</Badge>
            <h1 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Start free. Activate Beta Pro when revision needs more focus.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              Practise free SSC MCQs now. Verified beta users can activate Beta Pro for more MCQ practice and Weak Area Analysis. Board-only MCQ sets are coming soon.
            </p>
            <ul className="mx-auto mt-6 flex max-w-3xl flex-col items-center justify-center gap-3 text-sm font-medium text-foreground sm:flex-row sm:gap-0">
              {[
                "MCQ available now",
                "No payment during beta",
                "Weak Area Analysis available now",
              ].map((item, index) => (
                <li key={item} className="flex items-center gap-2 sm:px-5 sm:[&:not(:last-child)]:border-r sm:[&:not(:last-child)]:border-border">
                  {index === 1 ? <CheckCircle aria-hidden="true" className="size-5 text-primary" /> : index === 2 ? <Sparkles aria-hidden="true" className="size-5 text-primary" /> : <CheckCircle aria-hidden="true" className="size-5 text-success" />}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-10 md:pb-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <Card className="flex flex-col border-border/90 py-7 shadow-sm">
            <CardHeader className="items-center px-7 pb-4 text-center">
              <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
                <Zap aria-hidden="true" className="size-7" />
              </div>
              <CardTitle className="text-2xl">Free</CardTitle>
              <p className="mt-2 text-3xl font-bold text-foreground">Tk 0</p>
              <p className="text-sm text-muted-foreground">Focused MCQ practice</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-7">
              <ul className="mb-7 flex-1 space-y-4 border-t border-border pt-6 text-sm text-muted-foreground">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="min-h-11 w-full" variant="outline">
                <Link href="/subjects">Start free</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">No credit card required.</p>
            </CardContent>
          </Card>

          <Card className="relative flex flex-col border-primary py-7 shadow-lg shadow-primary/10">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1" variant="default">Best for focused revision</Badge>
            <CardHeader className="items-center px-7 pb-4 pt-8 text-center">
              <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" className="size-7" />
              </div>
              <CardTitle className="text-2xl">Beta Pro</CardTitle>
              <p className="mt-2 font-semibold text-primary">No payment during beta</p>
              <p className="text-sm text-muted-foreground">Optional access for verified beta users</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-7">
              <ul className="mb-7 flex-1 space-y-4 border-t border-border pt-6 text-sm text-muted-foreground">
                {betaProFeatures.map(({ label, availability }) => (
                  <li key={label} className="flex items-start gap-3">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="flex flex-1 flex-wrap items-center justify-between gap-2">
                      <span>{label}</span>
                      {availability && <AvailabilityBadge>{availability}</AvailabilityBadge>}
                    </span>
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

      <section className="container mx-auto px-4 pb-10 md:pb-14">
        <div className="mx-auto grid max-w-5xl items-center gap-7 rounded-2xl border border-primary/15 bg-primary/5 p-6 md:grid-cols-[1fr_1.15fr] md:p-8">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-0 bg-primary/10 text-primary" variant="secondary">Pro feature</Badge>
              <AvailabilityBadge>Available now</AvailabilityBadge>
            </div>
            <h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">Turn completed practice into a clearer next step</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Weak Area Analysis uses submitted MCQ performance to highlight chapters that may need more practice. It does not predict exam results or guarantee improvement.
            </p>
          </div>
          <div className="rounded-xl border border-primary/25 bg-background p-4 shadow-sm">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4" aria-hidden="true">
              <div className="mb-4 h-2 w-3/5 rounded-full bg-primary/20" />
              <div className="flex items-end gap-2">
                <div className="size-14 rounded-full border-8 border-primary border-r-primary/20" />
                <div className="flex flex-1 flex-col gap-2">
                  <span className="h-2 w-4/5 rounded-full bg-primary/25" />
                  <span className="h-2 w-3/5 rounded-full bg-primary/20" />
                  <span className="h-2 w-2/3 rounded-full bg-primary/15" />
                </div>
                <div className="flex h-14 items-end gap-1">
                  {["h-5", "h-9", "h-12", "h-7"].map((height) => <span key={height} className={`w-2 rounded-t bg-primary/50 ${height}`} />)}
                </div>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-3 divide-x divide-border text-center text-xs font-medium text-foreground">
              <li className="flex flex-col items-center gap-1 px-2"><BookOpen aria-hidden="true" className="size-5 text-primary" />Subject-led insights</li>
              <li className="flex flex-col items-center gap-1 px-2"><Target aria-hidden="true" className="size-5 text-primary" />Chapter performance</li>
              <li className="flex flex-col items-center gap-1 px-2"><ArrowRight aria-hidden="true" className="size-5 text-primary" />Recommended next practice</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-foreground">Beta access at a glance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <caption className="sr-only">Comparison of Free and Beta Pro access during beta</caption>
              <thead className="bg-muted/50 text-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Feature</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Free</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Beta Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row" className="px-5 py-3 font-medium text-foreground">{row.feature}</th>
                    <td className="px-5 py-3"><ComparisonValue value={row.free} /></td>
                    <td className="px-5 py-3"><ComparisonValue value={row.betaPro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
