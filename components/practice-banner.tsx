import { ChevronRight, Home } from "@/components/icons"
import type { IconComponent } from "@/components/icons"
import Link from "next/link"

interface PracticeBannerProps {
  icon: IconComponent
  subjectName: string
  subjectSlug: string
  modeName: string
  difficulty: string
  gradientClass: string
  iconBgClass: string
}

export function PracticeBanner({
  icon: Icon,
  subjectName,
  subjectSlug,
  modeName,
  difficulty,
  gradientClass,
  iconBgClass,
}: PracticeBannerProps) {
  return (
    <section className={`relative py-8 sm:py-12 md:py-16 overflow-hidden ${gradientClass}`}>
      {/* Floating accent dots - hidden on mobile for cleaner look */}
      <div className="hidden sm:block absolute top-6 left-6 w-2 h-2 rounded-full bg-white/20" />
      <div className="hidden sm:block absolute top-12 left-14 w-1.5 h-1.5 rounded-full bg-white/15" />
      <div className="hidden sm:block absolute bottom-10 left-10 w-3 h-3 rounded-full bg-white/10" />
      <div className="hidden sm:block absolute top-8 right-8 w-2 h-2 rounded-full bg-white/20" />
      <div className="hidden sm:block absolute bottom-6 right-14 w-3 h-3 rounded-full bg-white/10" />

      {/* Large decorative circles - hidden on mobile */}
      <div className="hidden md:block absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
      <div className="hidden md:block absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/5" />

      <div className="container mx-auto px-4 relative z-10">
        <nav className="flex items-center gap-1 text-xs sm:text-sm text-white/70 mb-4 sm:mb-6 flex-wrap">
          <Link href="/" className="flex items-center hover:text-white transition-colors">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <Link href="/subjects" className="hover:text-white transition-colors">
            Subjects
          </Link>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <Link href={`/subjects/${subjectSlug}`} className="hover:text-white transition-colors">
            {subjectName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="capitalize">{difficulty}</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-white font-medium">{modeName}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Icon - smaller on mobile */}
          <div
            className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl ${iconBgClass} shadow-lg shrink-0`}
          >
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>

          <div>
            {/* Title - responsive sizing */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
              {subjectName} — {modeName} Practice
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-xs sm:text-sm md:text-base">
              Answer the questions below. Your progress is saved automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
