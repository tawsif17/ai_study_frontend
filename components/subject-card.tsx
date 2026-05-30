import { Card, CardContent } from "@/components/ui/card"
import type { IconComponent } from "@/components/icons"
import { AuthGatedLink } from "@/components/auth-gated-link"

interface SubjectCardProps {
  icon: IconComponent
  title: string
  description: string
  color: string
}

export function SubjectCard({ icon: Icon, title, description, color }: SubjectCardProps) {
  return (
    <AuthGatedLink href="/subjects" className="block h-full">
      <Card className="group h-full cursor-pointer overflow-hidden border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <div className={`h-1.5 ${color}`} />
        <CardContent className="p-6">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color}/10`}>
            <Icon className={`h-7 w-7 ${color.replace("bg-", "text-")}`} />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </AuthGatedLink>
  )
}
