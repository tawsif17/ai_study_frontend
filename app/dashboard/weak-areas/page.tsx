import { PageShell } from "@/components/page-shell"
import { Breadcrumb } from "@/components/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Target } from "@/components/icons"

export default function WeakAreaDashboardPage() {
  // TODO: Backend does not currently provide weak areas analytics endpoint
  // This feature will be enabled once the backend supports:
  // - GET /analytics/weak-areas or similar endpoint
  
  return (
    <PageShell>
      {/* Header */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Weak Areas" },
              ]}
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Your Learning Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">Areas identified for targeted improvement</p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Card className="max-w-md mx-auto border-border">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground leading-relaxed">
              Weak area analysis will be available once you complete more practice sessions. 
              Keep practicing to unlock personalized insights.
            </p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}
