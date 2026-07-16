import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface PolicySummaryItem {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}

export interface PolicySection {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  groups?: Array<{
    title: string
    items: string[]
  }>
}

interface PolicyPageProps {
  title: string
  updatedAt: string
  description: string
  summary: PolicySummaryItem[]
  sections: PolicySection[]
  ctaTitle: string
  ctaDescription: string
  secondaryLink?: {
    href: string
    label: string
  }
}

export function PolicyPage({
  title,
  updatedAt,
  description,
  summary,
  sections,
  ctaTitle,
  ctaDescription,
  secondaryLink,
}: PolicyPageProps) {
  return (
    <PageShell>
      <section className="border-b border-border bg-[linear-gradient(180deg,rgba(19,117,201,0.08),rgba(255,255,255,0)_78%)]">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-14 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="border-transparent bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">Trust &amp; legal</Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground">Last updated: {updatedAt}</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12 lg:px-14">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-5 text-center">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${item.iconClassName}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-sm font-bold text-foreground">On this page</h2>
            <nav className="mt-3" aria-label={`${title} sections`}>
              <ol className="space-y-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-11 items-center rounded-md px-2 text-sm text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-border px-5 py-6 last:border-b-0 sm:px-7" aria-labelledby={`${section.id}-heading`}>
                <h2 id={`${section.id}-heading`} className="text-lg font-bold text-foreground sm:text-xl">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.items && <PolicyList items={section.items} />}
                  {section.groups?.map((group) => (
                    <div key={group.title} className="pt-1">
                      <h3 className="font-semibold text-foreground">{group.title}</h3>
                      <PolicyList items={group.items} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>

        <section className="mt-8 rounded-xl border border-primary/15 bg-primary/5 px-5 py-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-8" aria-labelledby="policy-help-heading">
          <div>
            <h2 id="policy-help-heading" className="text-lg font-bold text-foreground">{ctaTitle}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{ctaDescription}</p>
          </div>
          <div className="mt-4 flex shrink-0 flex-wrap gap-3 sm:mt-0">
            <Button className="rounded-lg shadow-primary" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
            {secondaryLink && (
              <Button variant="outline" className="rounded-lg border-primary text-primary hover:bg-primary/5" asChild>
                <Link href={secondaryLink.href}>
                  {secondaryLink.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </section>
    </PageShell>
  )
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
