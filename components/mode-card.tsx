import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { IconComponent } from "@/components/icons"
import { AuthGatedLink } from "@/components/auth-gated-link"

interface ModeCardProps {
  icon: IconComponent
  title: string
  description: string
  href: string
}

export function ModeCard({ icon: Icon, title, description, href }: ModeCardProps) {
  return (
    <Card className="group h-full border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
          <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full rounded-lg border-primary/20 bg-transparent" variant="outline" asChild>
          <AuthGatedLink href={href}>Start Practice</AuthGatedLink>
        </Button>
      </CardFooter>
    </Card>
  )
}
