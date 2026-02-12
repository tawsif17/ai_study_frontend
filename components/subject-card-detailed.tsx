import { AuthGatedLink } from "@/components/auth-gated-link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Subject } from "@/lib/api/types"
import { Calculator, Atom, FlaskConical } from "@/components/icons"

// Map subject names to their visual styles
// Since the backend only provides id and name, we maintain styling here
function getSubjectStyles(subjectName: string) {
  const name = subjectName.toLowerCase()
  if (name.includes("math") || name.includes("higher math")) {
    return {
      Icon: Calculator,
      colorClass: "bg-primary",
      iconBgClass: "bg-primary/10",
      iconTextClass: "text-primary",
    }
  }
  if (name.includes("physics")) {
    return {
      Icon: Atom,
      colorClass: "bg-accent",
      iconBgClass: "bg-accent/10",
      iconTextClass: "text-accent",
    }
  }
  if (name.includes("chemistry")) {
    return {
      Icon: FlaskConical,
      colorClass: "bg-orange-500",
      iconBgClass: "bg-orange-500/10",
      iconTextClass: "text-orange-500",
    }
  }
  // Default
  return {
    Icon: Calculator,
    colorClass: "bg-primary",
    iconBgClass: "bg-primary/10",
    iconTextClass: "text-primary",
  }
}

interface SubjectCardDetailedProps {
  subject: Subject
}

export function SubjectCardDetailed({ subject }: SubjectCardDetailedProps) {
  const { Icon, colorClass, iconBgClass, iconTextClass } = getSubjectStyles(subject.name)

  return (
    <Card className="group border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top color bar */}
      <div className={`h-1.5 ${colorClass}`} />

      <CardContent className="p-6 flex flex-col flex-1">
        {/* Icon */}
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${iconBgClass} group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className={`h-7 w-7 ${iconTextClass}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-card-foreground mb-2">{subject.name}</h3>

        {/* Tag - SSC */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="default" className="text-xs font-medium">
            SSC
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
          Practice {subject.name} with AI-powered mock tests and instant explanations.
        </p>

        {/* CTA Area */}
        <div className="mt-auto space-y-2">
          <Button className="w-full" asChild>
            <AuthGatedLink href={`/subjects/${subject.id}`}>View practice options</AuthGatedLink>
          </Button>
          <p className="text-xs text-muted-foreground text-center">MCQ • CQ mode</p>
        </div>
      </CardContent>
    </Card>
  )
}
