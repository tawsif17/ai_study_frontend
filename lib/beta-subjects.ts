import { Atom, Calculator, FlaskConical, type IconComponent } from "@/components/icons"
import type { Subject } from "@/lib/api/types"

export const betaSubjectKeys = ["general-math", "physics", "chemistry"] as const

export type BetaSubjectKey = (typeof betaSubjectKeys)[number]

export interface BetaSubjectPresentation {
  key: BetaSubjectKey
  title: string
  topics: string
  icon: IconComponent
  tone: string
}

export const betaSubjects: readonly BetaSubjectPresentation[] = [
  {
    key: "general-math",
    title: "General Math",
    topics: "Algebra, Geometry, Arithmetic, Mensuration",
    icon: Calculator,
    tone: "from-[#7777e8] to-[#535bc9]",
  },
  {
    key: "physics",
    title: "Physics",
    topics: "Light, Motion, Force, Electricity, Waves",
    icon: Atom,
    tone: "from-[#59c482] to-[#169750]",
  },
  {
    key: "chemistry",
    title: "Chemistry",
    topics: "Structure, Bonding, Reactions, Acids & Bases",
    icon: FlaskConical,
    tone: "from-[#ff9b42] to-[#f76707]",
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
