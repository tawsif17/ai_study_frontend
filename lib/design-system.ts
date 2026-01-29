/**
 * SHIKKHA BUDDY DESIGN SYSTEM
 * ============================
 * Central design tokens and utilities for consistent UI
 */

// ===========================================
// COLOR TOKENS
// ===========================================

export const colors = {
  // Primary palette
  primary: {
    DEFAULT: "var(--primary)",
    foreground: "var(--primary-foreground)",
  },
  secondary: {
    DEFAULT: "var(--secondary)",
    foreground: "var(--secondary-foreground)",
  },
  accent: {
    DEFAULT: "var(--accent)",
    foreground: "var(--accent-foreground)",
  },
  muted: {
    DEFAULT: "var(--muted)",
    foreground: "var(--muted-foreground)",
  },

  // Semantic colors
  success: {
    DEFAULT: "var(--success)",
    foreground: "var(--success-foreground)",
  },
  warning: {
    DEFAULT: "var(--warning)",
    foreground: "var(--warning-foreground)",
  },
  info: {
    DEFAULT: "var(--info)",
    foreground: "var(--info-foreground)",
  },
  destructive: {
    DEFAULT: "var(--destructive)",
    foreground: "var(--destructive-foreground)",
  },

  // Subject-specific colors
  subjects: {
    math: "var(--subject-math)",
    physics: "var(--subject-physics)",
    chemistry: "var(--subject-chemistry)",
  },

  // UI colors
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: {
    DEFAULT: "var(--card)",
    foreground: "var(--card-foreground)",
  },
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
} as const

// ===========================================
// SPACING SCALE
// ===========================================

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const

// ===========================================
// BORDER RADIUS
// ===========================================

export const borderRadius = {
  none: "0",
  xs: "0.125rem", // 2px
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  DEFAULT: "0.5rem", // 8px
  lg: "0.625rem", // 10px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const

// ===========================================
// SHADOWS
// ===========================================

export const shadows = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
  inner: "var(--shadow-inner)",
  primary: "var(--shadow-primary)",
  accent: "var(--shadow-accent)",
  none: "none",
} as const

// ===========================================
// TYPOGRAPHY
// ===========================================

export const typography = {
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1.16" }], // 48px
    "6xl": ["3.75rem", { lineHeight: "1.1" }], // 60px
  },
  fontWeight: {
    thin: "100",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const

// ===========================================
// TRANSITIONS
// ===========================================

export const transitions = {
  fast: "150ms ease",
  base: "200ms ease",
  slow: "300ms ease",
  slower: "500ms ease",
} as const

// ===========================================
// BREAKPOINTS
// ===========================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

// ===========================================
// Z-INDEX SCALE
// ===========================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const

// ===========================================
// COMPONENT VARIANTS (for reusable patterns)
// ===========================================

export const componentStyles = {
  // Card variants
  card: {
    base: "rounded-xl border border-border bg-card text-card-foreground",
    elevated: "rounded-xl bg-card text-card-foreground shadow-md",
    interactive:
      "rounded-xl border border-border bg-card text-card-foreground transition-all hover:shadow-lg hover:border-primary/20",
    glass: "rounded-xl glass border border-border/50",
  },

  // Button base styles (extend shadcn button)
  button: {
    base: "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    sizes: {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      xl: "h-12 px-8 text-lg",
    },
  },

  // Input styles
  input: {
    base: "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  },

  // Badge styles
  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    variants: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-border text-foreground",
    },
  },

  // Section layouts
  section: {
    base: "py-16 md:py-24",
    compact: "py-12 md:py-16",
    spacious: "py-20 md:py-32",
  },

  // Container widths
  container: {
    sm: "max-w-3xl mx-auto px-4",
    md: "max-w-5xl mx-auto px-4",
    lg: "max-w-6xl mx-auto px-4",
    xl: "max-w-7xl mx-auto px-4",
    full: "w-full px-4 md:px-6 lg:px-8",
  },
} as const

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get subject color by name
 */
export function getSubjectColor(subject: "math" | "physics" | "chemistry"): string {
  const subjectColors = {
    math: "bg-subject-math",
    physics: "bg-subject-physics",
    chemistry: "bg-subject-chemistry",
  }
  return subjectColors[subject]
}

/**
 * Get subject text color by name
 */
export function getSubjectTextColor(subject: "math" | "physics" | "chemistry"): string {
  const subjectColors = {
    math: "text-subject-math",
    physics: "text-subject-physics",
    chemistry: "text-subject-chemistry",
  }
  return subjectColors[subject]
}

/**
 * Get practice mode styles
 */
export function getPracticeModeStyle(mode: "mcq" | "cq" | "mixed"): {
  bg: string
  border: string
  icon: string
} {
  const modeStyles = {
    mcq: {
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: "text-primary",
    },
    cq: {
      bg: "bg-accent/10",
      border: "border-accent/20",
      icon: "text-accent",
    },
    mixed: {
      bg: "bg-success/10",
      border: "border-success/20",
      icon: "text-success",
    },
  }
  return modeStyles[mode]
}
