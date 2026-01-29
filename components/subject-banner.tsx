import type { IconComponent } from "@/components/icons"

interface SubjectBannerProps {
  icon: IconComponent
  name: string
  subtitle?: string
  gradientClass: string
  iconBgClass: string
}

export function SubjectBanner({
  icon: Icon,
  name,
  subtitle = "Choose how you want to practice.",
  gradientClass,
  iconBgClass,
}: SubjectBannerProps) {
  return (
    <section className={`relative py-10 sm:py-16 md:py-20 overflow-hidden ${gradientClass}`}>
      {/* Floating accent dots - hidden on mobile */}
      <div className="hidden sm:block absolute top-8 left-8 w-3 h-3 rounded-full bg-white/20" />
      <div className="hidden sm:block absolute top-16 left-16 w-2 h-2 rounded-full bg-white/15" />
      <div className="hidden sm:block absolute bottom-12 left-12 w-4 h-4 rounded-full bg-white/10" />
      <div className="hidden sm:block absolute top-10 right-10 w-3 h-3 rounded-full bg-white/20" />
      <div className="hidden sm:block absolute top-20 right-20 w-2 h-2 rounded-full bg-white/15" />
      <div className="hidden sm:block absolute bottom-8 right-16 w-4 h-4 rounded-full bg-white/10" />

      {/* Large decorative circles - hidden on mobile */}
      <div className="hidden md:block absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
      <div className="hidden md:block absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Icon - smaller on mobile */}
          <div
            className={`mb-4 sm:mb-6 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl ${iconBgClass} shadow-lg`}
          >
            <Icon className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
          </div>

          {/* Subject Name - responsive sizing */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">{name}</h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-md px-4 sm:px-0">{subtitle}</p>
        </div>
      </div>
    </section>
  )
}
