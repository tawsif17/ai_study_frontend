"use client"

import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItem {
  value: string
  question: string
  answer: React.ReactNode
}

const frequentlyAsked: FAQItem[] = [
  {
    value: "available-subjects",
    question: "Which subjects are available during the beta?",
    answer: "General Math, Physics, and Chemistry are available during the beta.",
  },
  {
    value: "practice-now",
    question: "What can I practise right now?",
    answer:
      "MCQ practice is available during the beta. CQ and Mixed Practice are coming soon and are not currently selectable.",
  },
  {
    value: "beta-pro",
    question: "What is Beta Pro?",
    answer:
      "Beta Pro is optional access for verified beta users. It includes Board-only MCQ sets and Weak Area Analysis and does not create a paid subscription.",
  },
  {
    value: "beta-payment",
    question: "Is payment required during the beta?",
    answer:
      "No. Activating Beta Pro during the beta does not require payment and does not start a trial, renewal, or automatic billing.",
  },
  {
    value: "board-only",
    question: "How do Board-only MCQ sets work?",
    answer:
      "Board-only MCQ sets are available through Beta Pro for focused past-board-question revision.",
  },
]

const usingShikkhaBuddy: FAQItem[] = [
  {
    value: "ai-mistakes",
    question: "Can AI-generated content contain mistakes?",
    answer:
      "Yes. AI-generated questions, feedback, and explanations may contain mistakes. Check important answers against textbooks, teachers, or other trusted learning materials.",
  },
  {
    value: "data-use",
    question: "How is my data used?",
    answer: (
      <>
        Account and practice information is used to provide and support the learning experience. Read the{" "}
        <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary/80" href="/privacy">
          Privacy Policy
        </Link>{" "}
        for more information.
      </>
    ),
  },
  {
    value: "contact-support",
    question: "How do I contact support?",
    answer: (
      <>
        Use the{" "}
        <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary/80" href="/contact">
          Contact page
        </Link>{" "}
        for help with your account, practice sessions, or learning content.
      </>
    ),
  },
]

function FAQGroup({
  title,
  items,
  defaultValue,
}: {
  title: string
  items: FAQItem[]
  defaultValue?: string
}) {
  return (
    <section aria-labelledby={`${items[0].value}-heading`}>
      <div className="mb-3 flex items-center gap-3">
        <h2 id={`${items[0].value}-heading`} className="shrink-0 text-sm font-semibold text-primary">
          {title}
        </h2>
        <span className="h-px flex-1 bg-primary/20" aria-hidden="true" />
      </div>

      <Accordion type="single" collapsible defaultValue={defaultValue} className="space-y-2">
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="overflow-hidden rounded-xl border border-primary/15 bg-background shadow-[0_1px_3px_rgba(15,43,91,0.04)]"
          >
            <AccordionTrigger className="min-h-12 px-4 py-3 text-[0.9375rem] font-semibold text-foreground hover:bg-primary/[0.035] hover:no-underline focus-visible:z-10 focus-visible:ring-primary/35 sm:px-5">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm leading-6 text-muted-foreground sm:px-5 sm:text-[0.9375rem]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export function FAQContent() {
  return (
    <PageShell mainClassName="bg-[radial-gradient(circle_at_50%_4%,rgba(59,130,246,0.09),transparent_30rem)]">
      <section className="px-4 pb-8 pt-10 text-center sm:pb-10 sm:pt-14 lg:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto mb-4 w-fit rounded-full bg-primary/[0.07] px-4 py-1.5 text-sm font-semibold text-primary">
            Help centre
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Questions about practising with Shikkha Buddy?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Clear answers about beta access, subjects, practice modes, AI content, and support.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl space-y-7 px-4 pb-12 sm:space-y-8 sm:px-6 sm:pb-16">
        <FAQGroup title="Frequently asked" items={frequentlyAsked} defaultValue="available-subjects" />
        <FAQGroup title="Using Shikkha Buddy" items={usingShikkhaBuddy} />

        <section className="rounded-2xl border border-primary/15 bg-primary/[0.045] p-5 shadow-[0_8px_24px_rgba(15,43,91,0.04)] sm:p-6" aria-labelledby="faq-cta-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary" aria-hidden="true">
                <CircleHelp className="size-7" />
              </span>
              <div>
                <h2 id="faq-cta-heading" className="text-lg font-semibold text-foreground sm:text-xl">
                  Still have a question?
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Contact us for help with your account, practice sessions, or learning content.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button variant="link" className="min-h-11 justify-center px-4 text-primary" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button className="min-h-11 rounded-lg px-6 shadow-primary" asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
