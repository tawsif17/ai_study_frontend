import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TrustPageSection {
  title: string
  body?: string
  items?: string[]
}

interface TrustPageProps {
  eyebrow: string
  title: string
  description: string
  sections: TrustPageSection[]
  ctaLabel?: string
  ctaHref?: string
}

export function TrustPage({
  eyebrow,
  title,
  description,
  sections,
  ctaLabel = "Contact us",
  ctaHref = "/contact",
}: TrustPageProps) {
  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0))]">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 md:mb-6">
              <Breadcrumb items={[{ label: title }]} />
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
              <h1 className="mb-3 text-3xl font-bold text-foreground text-balance md:mb-4 md:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-foreground md:text-xl">{section.title}</h2>
                {section.body && <p className="text-sm leading-7 text-muted-foreground md:text-base">{section.body}</p>}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground md:text-base">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="container mx-auto px-4 py-8 text-center md:py-12">
          <h2 className="mb-2 text-lg font-semibold text-foreground md:text-xl">Need help?</h2>
          <p className="mx-auto mb-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            Use the contact page for account questions, content issues, or support requests.
          </p>
          <Button variant="outline" className="rounded-lg border-primary/20 bg-background" asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
