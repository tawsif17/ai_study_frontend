import type { Metadata } from "next"
import { PageShell } from "@/components/page-shell"
import { WeakAreasContent } from "@/components/weak-areas-content"

export const metadata: Metadata = {
  title: "Weak Areas | Shikkha Buddy",
  robots: { index: false, follow: false },
}

export default function WeakAreaDashboardPage() {
  return (
    <PageShell>
      <WeakAreasContent />
    </PageShell>
  )
}
