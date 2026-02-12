"use client"

import { useState } from "react"
import Link from "next/link"
import { SubjectBanner } from "@/components/subject-banner"
import { PracticeConfigCard } from "@/components/practice-config-card"
import { FeatureCard } from "@/components/feature-card"
import { ListChecks, FileText, Shuffle, Zap, BookCheck, Target, ArrowLeft, Calculator, Atom, FlaskConical } from "@/components/icons"
import { useChapters } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Map subject names to their visual styles
function getSubjectStyles(subjectName: string) {
  const name = subjectName.toLowerCase()
  if (name.includes("math") || name.includes("higher math")) {
    return {
      Icon: Calculator,
      gradientClass: "bg-gradient-to-br from-primary to-primary/80",
      iconBgClass: "bg-white/20",
      mcqIconBg: "bg-primary/10",
      mcqIconText: "text-primary",
      cqIconBg: "bg-accent/10",
      cqIconText: "text-accent",
    }
  }
  if (name.includes("physics")) {
    return {
      Icon: Atom,
      gradientClass: "bg-gradient-to-br from-accent to-accent/80",
      iconBgClass: "bg-white/20",
      mcqIconBg: "bg-accent/10",
      mcqIconText: "text-accent",
      cqIconBg: "bg-primary/10",
      cqIconText: "text-primary",
    }
  }
  if (name.includes("chemistry")) {
    return {
      Icon: FlaskConical,
      gradientClass: "bg-gradient-to-br from-orange-500 to-orange-400",
      iconBgClass: "bg-white/20",
      mcqIconBg: "bg-orange-500/10",
      mcqIconText: "text-orange-500",
      cqIconBg: "bg-accent/10",
      cqIconText: "text-accent",
    }
  }
  // Default
  return {
    Icon: Calculator,
    gradientClass: "bg-gradient-to-br from-primary to-primary/80",
    iconBgClass: "bg-white/20",
    mcqIconBg: "bg-primary/10",
    mcqIconText: "text-primary",
    cqIconBg: "bg-accent/10",
    cqIconText: "text-accent",
  }
}

interface SubjectDetailContentProps {
  subjectId: number
  subjectName: string
  examTypeId: number
}

export function SubjectDetailContent({ subjectId, subjectName, examTypeId }: SubjectDetailContentProps) {
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([])
  const { chapters, isLoading: chaptersLoading } = useChapters(subjectId)
  
  const styles = getSubjectStyles(subjectName)
  const SubjectIcon = styles.Icon

  const handleChapterToggle = (chapterId: number) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  const handleSelectAll = () => {
    if (chapters) {
      if (selectedChapterIds.length === chapters.length) {
        setSelectedChapterIds([])
      } else {
        setSelectedChapterIds(chapters.map((c) => c.id))
      }
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all subjects
        </Link>
      </div>

      {/* Banner Section */}
      <SubjectBanner
        icon={SubjectIcon}
        name={subjectName}
        gradientClass={styles.gradientClass}
        iconBgClass={styles.iconBgClass}
      />

      {/* Chapter Selection Section */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Chapters to Practice</h2>
            
            {chaptersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : chapters && chapters.length > 0 ? (
              <Card className="border-border">
                <CardContent className="p-4">
                  {/* Select All */}
                  <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
                    <Checkbox
                      id="select-all"
                      checked={selectedChapterIds.length === chapters.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select all chapters ({chapters.length})
                    </Label>
                  </div>
                  
                  {/* Chapter List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center gap-3 py-2">
                        <Checkbox
                          id={`chapter-${chapter.id}`}
                          checked={selectedChapterIds.includes(chapter.id)}
                          onCheckedChange={() => handleChapterToggle(chapter.id)}
                        />
                        <Label
                          htmlFor={`chapter-${chapter.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {chapter.chapter_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No chapters available.</p>
            )}

            {selectedChapterIds.length === 0 && chapters && chapters.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Select at least one chapter to start practicing.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Practice Mode Cards Section */}
      <section className="py-8 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PracticeConfigCard
              mode="MCQ"
              subjectId={subjectId}
              examTypeId={examTypeId}
              chapterIds={selectedChapterIds}
              icon={ListChecks}
              title="MCQ Practice"
              subtitle="Multiple choice questions with instant AI feedback."
              tag="Best for quick revision"
              iconBgClass={styles.mcqIconBg}
              iconTextClass={styles.mcqIconText}
              disabled={selectedChapterIds.length === 0}
            />
            <PracticeConfigCard
              mode="CQ"
              subjectId={subjectId}
              examTypeId={examTypeId}
              chapterIds={selectedChapterIds}
              icon={FileText}
              title="CQ Practice"
              subtitle="Creative Questions with AI-generated explanations."
              tag="Board exam style"
              iconBgClass={styles.cqIconBg}
              iconTextClass={styles.cqIconText}
              disabled={selectedChapterIds.length === 0}
            />
            <PracticeConfigCard
              mode="MIXED"
              subjectId={subjectId}
              examTypeId={examTypeId}
              chapterIds={selectedChapterIds}
              icon={Shuffle}
              title="Mixed Practice"
              subtitle="Combined MCQ + CQ practice in one session."
              tag="Exam simulation"
              iconBgClass="bg-secondary"
              iconTextClass="text-secondary-foreground"
              disabled={selectedChapterIds.length === 0}
            />
          </div>
        </div>
      </section>

      {/* Features Row Section */}
      <section className="py-12 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={Zap}
              title="Practice that adapts"
              description="AI-generated questions matched to your level."
            />
            <FeatureCard
              icon={BookCheck}
              title="Learn with clarity"
              description="Instant explanations with textbook-based references."
            />
            <FeatureCard
              icon={Target}
              title="Build confidence"
              description="Track progress, identify weak areas, and improve steadily."
            />
          </div>
        </div>
      </section>
    </>
  )
}
