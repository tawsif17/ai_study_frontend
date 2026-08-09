import { Atom, BookOpen, Calculator, FlaskConical, type IconComponent } from "@/components/icons"
import type { Subject } from "@/lib/api/types"

export const betaSubjectKeys = ["general-math", "physics", "chemistry"] as const

export type BetaSubjectKey = (typeof betaSubjectKeys)[number]

export interface BetaSubjectPresentation {
  key: string
  title: string
  topics: string
  icon: IconComponent
  tone: string
  destination: string
}

export const betaSubjects: readonly BetaSubjectPresentation[] = [
  {
    key: "general-math",
    title: "Mathematics",
    topics: "Algebra, Geometry, Arithmetic, Mensuration",
    icon: Calculator,
    tone: "from-[#7777e8] to-[#535bc9]",
    destination: "/subjects?subject=general-math",
  },
  {
    key: "physics",
    title: "Physics",
    topics: "Light, Motion, Force, Electricity, Waves",
    icon: Atom,
    tone: "from-[#59c482] to-[#169750]",
    destination: "/subjects?subject=physics",
  },
  {
    key: "chemistry",
    title: "Chemistry",
    topics: "Structure, Bonding, Reactions, Acids & Bases",
    icon: FlaskConical,
    tone: "from-[#ff9b42] to-[#f76707]",
    destination: "/subjects?subject=chemistry",
  },
]

export function getBetaSubjectKey(value: string | null): BetaSubjectKey | null {
  return betaSubjectKeys.includes(value as BetaSubjectKey) ? (value as BetaSubjectKey) : null
}

export function findCatalogSubjectForBetaKey(
  subjects: Subject[],
  key: BetaSubjectKey
): Subject | undefined {
  return subjects.find((subject) => {
    const name = subject.name.trim().toLowerCase()

    if (key === "general-math") return name.includes("math")
    return name === key
  })
}

export function getCatalogSubjectPresentation(subject: Subject): BetaSubjectPresentation {
  const name = subject.name.trim().toLowerCase()
  const knownPresentation = betaSubjects.find((presentation) => {
    if (presentation.key === "general-math") return name.includes("math")
    return name === presentation.key
  })

  return {
    key: `catalog-${subject.id}`,
    title: subject.name,
    topics: knownPresentation?.topics ?? "Choose chapters and start focused MCQ practice.",
    icon: knownPresentation?.icon ?? BookOpen,
    tone: knownPresentation?.tone ?? "from-[#3b82f6] to-[#1d4ed8]",
    destination: `/subjects/${subject.id}`,
  }
}
