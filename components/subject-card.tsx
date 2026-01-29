import { Card, CardContent } from "@/components/ui/card"
import type { IconComponent } from "@/components/icons"
import Link from "next/link"

interface SubjectCardProps {
  icon: IconComponent
  title: string
  description: string
  color: string
  slug: string
}

export function SubjectCard({ icon: Icon, title, description, color, slug }: SubjectCardProps) {
  return (
    <Link href={`/subjects/${slug}`} className="block">
      <Card className="border-border bg-card hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden">
        <div className={`h-2 ${color}`} />
        <CardContent className="p-6">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color}/10`}>
            <Icon className={`h-7 w-7 ${color.replace("bg-", "text-")}`} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
