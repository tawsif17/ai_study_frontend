/**
 * Shared type definitions for Shikkha Buddy
 * 
 * NOTE: Backend-specific types are in /lib/api/types.ts
 * This file contains frontend-only display/styling types
 */

// ============================================
// DISPLAY STYLES (Frontend-only, for styling)
// ============================================

export interface SubjectStyleConfig {
  gradientClass: string
  iconBgClass: string
  accentColor?: string
  mcqIconBg?: string
  mcqIconText?: string
  cqIconBg?: string
  cqIconText?: string
}

// Subject styles configuration (mapped by subject name pattern)
// Since backend only provides id and name, we map styles based on name
export function getSubjectStyleByName(subjectName: string): SubjectStyleConfig {
  const name = subjectName.toLowerCase()
  
  if (name.includes("math") || name.includes("higher math")) {
    return {
      gradientClass: "bg-gradient-to-br from-primary to-primary/80",
      iconBgClass: "bg-white/20",
      accentColor: "bg-primary",
      mcqIconBg: "bg-primary/10",
      mcqIconText: "text-primary",
      cqIconBg: "bg-accent/10",
      cqIconText: "text-accent",
    }
  }
  
  if (name.includes("physics")) {
    return {
      gradientClass: "bg-gradient-to-br from-accent to-accent/80",
      iconBgClass: "bg-white/20",
      accentColor: "bg-accent",
      mcqIconBg: "bg-accent/10",
      mcqIconText: "text-accent",
      cqIconBg: "bg-primary/10",
      cqIconText: "text-primary",
    }
  }
  
  if (name.includes("chemistry")) {
    return {
      gradientClass: "bg-gradient-to-br from-orange-500 to-orange-400",
      iconBgClass: "bg-white/20",
      accentColor: "bg-orange-500",
      mcqIconBg: "bg-orange-500/10",
      mcqIconText: "text-orange-500",
      cqIconBg: "bg-accent/10",
      cqIconText: "text-accent",
    }
  }
  
  // Default
  return {
    gradientClass: "bg-gradient-to-br from-primary to-primary/80",
    iconBgClass: "bg-white/20",
    accentColor: "bg-primary",
    mcqIconBg: "bg-primary/10",
    mcqIconText: "text-primary",
    cqIconBg: "bg-accent/10",
    cqIconText: "text-accent",
  }
}

// ============================================
// DEPRECATED - Types kept for backwards compatibility
// These will be removed once all components are migrated
// ============================================

// TODO: Remove these deprecated types once migration is complete
export type SubjectSlug = "higher-math" | "physics" | "chemistry"
export type Difficulty = "easy" | "standard" | "hard"
export type PracticeMode = "mcq" | "cq" | "mixed"

// Deprecated - use getSubjectStyleByName instead
export const SUBJECT_STYLES: Record<SubjectSlug, SubjectStyleConfig> = {
  "higher-math": getSubjectStyleByName("higher math"),
  physics: getSubjectStyleByName("physics"),
  chemistry: getSubjectStyleByName("chemistry"),
}

export function getSubjectStyle(subject: SubjectSlug): SubjectStyleConfig {
  return SUBJECT_STYLES[subject] || SUBJECT_STYLES["higher-math"]
}
