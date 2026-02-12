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
    <Card className="border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-transparent" variant="outline" asChild>
          <AuthGatedLink href={href}>Start Practice</AuthGatedLink>
        </Button>
      </CardFooter>
    </Card>
  )
}
