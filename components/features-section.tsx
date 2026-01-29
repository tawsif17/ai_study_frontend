"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, BookOpen, TrendingUp, ChevronDown, type IconComponent } from "@/components/icons"
import { cn } from "@/lib/utils"

interface Feature {
  icon: IconComponent
  title: string
  shortTitle: string
  description: string
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "Practice that adapts to you",
    shortTitle: "Adaptive practice",
    description: "AI-generated questions matched to your level.",
  },
  {
    icon: BookOpen,
    title: "Learn with clarity",
    shortTitle: "Clear explanations",
    description: "Instant explanations with textbook-based references.",
  },
  {
    icon: TrendingUp,
    title: "Build confidence over time",
    shortTitle: "Track progress",
    description: "Track progress, identify weak areas, and improve steadily.",
  },
]

function MobileFeatureItem({ feature, isOpen, onToggle }: { feature: Feature; isOpen: boolean; onToggle: () => void }) {
  const Icon = feature.icon
  
  return (
    <button
      onClick={onToggle}
      className="w-full text-left"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">{feature.shortTitle}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-24 opacity-100 pb-2" : "max-h-0 opacity-0"
        )}
      >
        <p className="pl-11 text-xs text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </button>
  )
}

function DesktopFeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  )
}

export function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-10 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header - compact on mobile */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">
            Your learning companion
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto hidden md:block">
            Designed to help you prepare efficiently and build lasting confidence.
          </p>
        </div>

        {/* Mobile: Compact vertical list */}
        <div className="md:hidden">
          <div className="divide-y divide-border rounded-lg border border-border bg-card px-4">
            {features.map((feature, index) => (
              <MobileFeatureItem
                key={index}
                feature={feature}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Card grid (unchanged) */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <DesktopFeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
