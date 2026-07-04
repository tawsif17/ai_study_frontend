import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-xl border border-l-4 px-4 py-4 text-sm shadow-sm has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 sm:text-base [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground',
        info:
          'border-info/45 bg-info/10 text-info shadow-info/10 *:data-[slot=alert-description]:text-foreground/80',
        success:
          'border-success/50 bg-success/15 text-success shadow-success/10 *:data-[slot=alert-description]:text-foreground/80',
        destructive:
          'border-destructive/50 bg-destructive/10 text-destructive shadow-destructive/10 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm leading-relaxed break-words sm:text-base [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
