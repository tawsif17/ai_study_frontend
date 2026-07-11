import { AuthGatedLink } from "@/components/auth-gated-link"
import { CheckCircle } from "@/components/icons"
import { Radical } from "lucide-react"
import type { BetaSubjectPresentation } from "@/lib/beta-subjects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SubjectCardDetailedProps {
  subject: BetaSubjectPresentation
}

export function SubjectCardDetailed({ subject }: SubjectCardDetailedProps) {
  const Icon = subject.icon
  const destination = `/subjects?subject=${subject.key}`

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-5">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-22 sm:w-22 ${subject.tone}`}
        >
          {subject.key === "general-math" ? (
            <span className="relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11" aria-hidden="true">
              <Radical className="h-full w-full text-white" aria-hidden="true" />
              <span className="absolute right-0 top-0 text-2xl font-semibold leading-none text-white sm:text-3xl" aria-hidden="true">
                x
              </span>
            </span>
          ) : (
            <Icon className="h-10 w-10 text-white sm:h-11 sm:w-11" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 max-w-56">
          <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">SSC</Badge>
          <h3 className="mt-3 text-xl font-bold text-foreground">{subject.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{subject.topics}</p>
        </div>
      </div>

      <div className="my-6 border-t border-border" />

      <p className="flex items-center gap-3 text-sm text-muted-foreground">
        <CheckCircle className="h-5 w-5 shrink-0 text-[#067647]" aria-hidden="true" />
        MCQ practice available
      </p>

      <Button className="mt-6 h-13 w-full rounded-lg text-base shadow-primary" asChild>
        <AuthGatedLink href={destination}>Start Practice</AuthGatedLink>
      </Button>
    </article>
  )
}
