"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

interface AlertDialogTriggerProps {
  asChild?: boolean
  children?: React.ReactNode
}

interface AlertDialogContentProps {
  className?: string
  children?: React.ReactNode
}

interface AlertDialogHeaderProps {
  className?: string
  children?: React.ReactNode
}

interface AlertDialogFooterProps {
  className?: string
  children?: React.ReactNode
}

interface AlertDialogTitleProps {
  className?: string
  children?: React.ReactNode
}

interface AlertDialogDescriptionProps {
  className?: string
  children?: React.ReactNode
}

interface AlertDialogActionProps {
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

interface AlertDialogCancelProps {
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

const AlertDialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

function AlertDialog({
  open,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newOpen)
      } else {
        setInternalOpen(newOpen)
      }
    },
    [isControlled, onOpenChange]
  )

  return (
    <AlertDialogContext.Provider
      value={{ open: currentOpen, onOpenChange: handleOpenChange }}
    >
      {children}
    </AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger({
  asChild,
  children,
}: AlertDialogTriggerProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => onOpenChange(true),
    })
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  )
}

function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  const { open, onOpenChange } = React.useContext(AlertDialogContext)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-lg rounded-xl bg-background p-6 shadow-lg",
            className
          )}
          role="alertdialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
        className
      )}
    >
      {children}
    </div>
  )
}

function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

function AlertDialogAction({ className, onClick, children }: AlertDialogActionProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.()
        onOpenChange(false)
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-4 text-sm font-medium hover:bg-primary/90",
        className
      )}
    >
      {children}
    </button>
  )
}

function AlertDialogCancel({ className, onClick, children }: AlertDialogCancelProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.()
        onOpenChange(false)
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-input bg-background h-8 px-4 text-sm font-medium hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
