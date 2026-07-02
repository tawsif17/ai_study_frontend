"use client"

import { FormEvent, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { reportQuestion } from "@/lib/api"
import { formatApiError } from "@/lib/api/client"
import {
  questionReportReasonOptions,
  type QuestionReportReasonCode,
} from "@/lib/api/types"

interface QuestionReportDialogProps {
  questionId?: number
}

const maxDetailsLength = 1000

export function QuestionReportDialog({ questionId }: QuestionReportDialogProps) {
  const detailsId = useId()
  const [open, setOpen] = useState(false)
  const [reasonCode, setReasonCode] = useState<QuestionReportReasonCode | "">("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const resetForm = () => {
    setReasonCode("")
    setDetails("")
    setIsSubmitting(false)
    setError(null)
    setSuccessMessage(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!questionId || !reasonCode || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await reportQuestion(questionId, {
        reason_code: reasonCode,
        ...(details.trim() ? { details } : {}),
      })
      setSuccessMessage(response.message)
      setReasonCode("")
      setDetails("")
    } catch (submitError) {
      setError(formatApiError(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!questionId) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-xs">
          Report Question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Question</DialogTitle>
          <DialogDescription>
            Choose the reason that best describes the problem with this question.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Reason</legend>
            <RadioGroup
              value={reasonCode}
              onValueChange={(value) => setReasonCode(value as QuestionReportReasonCode)}
              aria-label="Report reason"
            >
              {questionReportReasonOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <RadioGroupItem value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={detailsId} className="text-sm font-medium">
              Details <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id={detailsId}
              maxLength={maxDetailsLength}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              disabled={isSubmitting}
              placeholder="Add a short note to help reviewers understand the issue."
              className="min-h-28"
            />
            <p className="text-right text-xs text-muted-foreground">
              {details.length}/{maxDetailsLength}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {successMessage && (
            <p role="status" className="text-sm text-success">
              {successMessage}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!reasonCode || isSubmitting || !questionId}>
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
