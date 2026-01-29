import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { IconComponent } from "@/components/icons"

interface PracticeModeCardProps {
  icon: IconComponent
  title: string
  description: string
  tag: string
  iconBgClass?: string
  iconTextClass?: string
}

export function PracticeModeCard({
  icon: Icon,
  title,
  description,
  tag,
  iconBgClass = "bg-primary/10",
  iconTextClass = "text-primary",
}: PracticeModeCardProps) {
  return (
    <Card className="group border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
      <CardContent className="p-6 flex-1">
        {/* Icon */}
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${iconBgClass} group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className={`h-7 w-7 ${iconTextClass}`} />
        </div>

        {/* Tag */}
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {tag}
        </Badge>

        {/* Title */}
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full">Start Practice</Button>
      </CardFooter>
    </Card>
  )
}
