"use client"

import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookmarkCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  RotateCcw,
  TrendingUp,
} from "@/components/icons"
import { useAuth } from "@/lib/auth-context"
import type { AuthUser } from "@/lib/api"
import { cn } from "@/lib/utils"

const RETURN_PATH = "/profile"

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

const nextSteps: Array<{
  title: string
  description: string
  action: string
  href: string
  icon: IconComponent
  iconClassName: string
}> = [
  {
    title: "Start MCQ practice",
    description: "Choose General Math, Physics, or Chemistry and practise by topic.",
    action: "Choose a subject",
    href: "/subjects",
    icon: BookOpen,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Review weak areas",
    description: "Use submitted MCQ results to see which chapters need another look.",
    action: "View weak areas",
    href: "/dashboard/weak-areas",
    icon: TrendingUp,
    iconClassName: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Review bookmarked questions",
    description: "Revisit questions you saved and mistakes from submitted MCQ sessions.",
    action: "View bookmarks",
    href: "/bookmarks",
    icon: BookmarkCheck,
    iconClassName: "bg-primary/10 text-primary",
  },
]

function getDisplayName(user: AuthUser): string {
  const name = user.full_name.trim()
  return name || user.email.split("@")[0] || "Student"
}

function getFirstName(user: AuthUser): string {
  return getDisplayName(user).split(/\s+/)[0]
}

function getInitials(user: AuthUser): string {
  const words = getDisplayName(user).split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }
  return words[0]?.slice(0, 2).toUpperCase() || "SB"
}

export function ProfileContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshFailed, setRefreshFailed] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(RETURN_PATH)}`)
    }
  }, [isAuthenticated, isLoading, router])

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setRefreshFailed(false)
    const refreshedUser = await refreshUser()
    setRefreshFailed(!refreshedUser)
    setIsRefreshing(false)
  }

  if (isLoading) {
    return (
      <PageShell mainClassName="bg-[radial-gradient(circle_at_50%_0%,rgba(19,117,201,0.07),transparent_34rem)]">
        <ProfileSkeleton />
      </PageShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="flex min-h-[34rem] items-center justify-center px-4 py-12" role="status">
          Redirecting to login…
        </div>
      </PageShell>
    )
  }

  if (!user) {
    return (
      <PageShell>
        <div className="container mx-auto flex min-h-[34rem] max-w-2xl items-center justify-center px-4 py-12">
          <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm" aria-labelledby="profile-unavailable-heading">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 id="profile-unavailable-heading" className="mt-5 text-2xl font-bold text-foreground">Profile unavailable</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">We could not load your account details. Refresh your profile to try again.</p>
            <Button type="button" className="mt-6 min-h-11 gap-2" onClick={handleRefresh} disabled={isRefreshing}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {isRefreshing ? "Refreshing…" : "Refresh profile"}
            </Button>
            {refreshFailed && <p className="mt-4 text-sm text-destructive" role="alert">Your profile is still unavailable. Please sign in again.</p>}
          </section>
        </div>
      </PageShell>
    )
  }

  return <ProfileView user={user} />
}

function ProfileView({ user }: { user: AuthUser }) {
  return (
    <PageShell mainClassName="bg-[radial-gradient(circle_at_50%_0%,rgba(19,117,201,0.07),transparent_34rem)]">
      <div className="container mx-auto max-w-[84rem] px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Your next step</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Welcome back, {getFirstName(user)}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Your profile keeps your account details and next practice steps in one place.</p>
            </div>
            <span className="w-fit rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">Account overview</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.25fr)] lg:items-stretch">
          <ProfileDetails user={user} />

          <section aria-labelledby="profile-next-steps-heading">
            <h2 id="profile-next-steps-heading" className="sr-only">Choose your next step</h2>
            <div className="grid h-full gap-4">
              {nextSteps.map((step) => (
                <NextStepCard key={step.href} {...step} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  )
}

function ProfileDetails({ user }: { user: AuthUser }) {
  const displayName = getDisplayName(user)
  const planLabel = user.plan_tier === "pro" ? "Beta Pro access" : "Free access"
  const classLabel = user.student_class === null ? "Not provided" : `Class ${user.student_class}`

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7" aria-labelledby="account-details-heading">
      <div className="flex items-center gap-5 border-b border-border pb-6">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,rgba(19,117,201,0.16),rgba(19,117,201,0.06))] text-2xl font-bold text-primary" aria-hidden="true">
          {getInitials(user)}
        </div>
        <div className="min-w-0">
          <h2 id="account-details-heading" className="truncate text-xl font-bold text-foreground">{displayName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{planLabel}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-5">
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="School" value={user.school?.trim() || "Not provided"} />
        <ProfileField label="Class" value={classLabel} />
        <ProfileField label="City" value={user.city?.trim() || "Not provided"} />
      </dl>

      <div className={cn("mt-6 flex min-h-11 items-center gap-2 text-sm font-medium", user.email_verified_at ? "text-emerald-700" : "text-amber-700")}>
        {user.email_verified_at ? (
          <CheckCircle className="h-5 w-5" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        )}
        {user.email_verified_at ? "Email verified" : "Email not verified"}
      </div>
    </section>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-base font-medium text-foreground">{value}</dd>
    </div>
  )
}

function NextStepCard({ title, description, action, href, icon: Icon, iconClassName }: (typeof nextSteps)[number]) {
  return (
    <Link
      href={href}
      className="group grid min-h-32 grid-cols-[4rem_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-6"
      aria-label={`${action}: ${title}`}
    >
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20", iconClassName)}>
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      <span className="col-span-2 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary sm:col-span-1 sm:pl-3">
        {action}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
      </span>
    </Link>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-[84rem] px-4 py-10 sm:px-6 sm:py-12 lg:py-14" role="status" aria-label="Loading profile">
      <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-5 h-12 max-w-xl animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.25fr)]">
        <div className="h-[34rem] animate-pulse rounded-2xl border border-border bg-card motion-reduce:animate-none" />
        <div className="grid gap-4">
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card motion-reduce:animate-none" />
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card motion-reduce:animate-none" />
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">Loading your profile.</span>
    </div>
  )
}
