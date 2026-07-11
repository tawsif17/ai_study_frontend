import { ListChecks, TrendingUp, Zap, type IconComponent } from "@/components/icons"

interface Feature {
  icon: IconComponent
  title: string
  description: string
  tone: string
}

const features: Feature[] = [
  {
    icon: ListChecks,
    title: "Topic-wise MCQs",
    description: "Practice by chapter and concept.",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Answer explanations",
    description: "See why an answer is right or wrong.",
    tone: "bg-[#dcfae6] text-[#12b76a]",
  },
  {
    icon: TrendingUp,
    title: "Mistake review",
    description: "Know what to revise next.",
    tone: "bg-[#fff4e5] text-[#f79009]",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-0 rounded-2xl border border-border bg-card shadow-sm md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="flex items-center gap-5 p-6 md:p-8 md:[&:not(:last-child)]:border-r md:[&:not(:last-child)]:border-border"
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${feature.tone}`}>
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{feature.title}</h2>
                  <p className="mt-2 max-w-48 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
