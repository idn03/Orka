"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { X } from "lucide-react"

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

interface PopoverTriggerProps {
  asChild?: boolean
  children?: React.ReactNode
}

interface PopoverContentProps {
  className?: string
  children?: React.ReactNode
  align?: "center" | "start" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

interface DatePickerProps {
  value?: string | null
  onChange?: (date: string | null) => void
  placeholder?: string
  className?: string
}

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

function Popover({ open, onOpenChange, children }: PopoverProps) {
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
    <PopoverContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const { onOpenChange } = React.useContext(PopoverContext)

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

function PopoverContent({
  className,
  children,
  align = "center",
  side = "bottom",
}: PopoverContentProps) {
  const { open, onOpenChange } = React.useContext(PopoverContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "z-50 bg-background rounded-lg border shadow-md",
        side === "top" && "bottom-full mb-2",
        side === "bottom" && "top-full mt-2",
        side === "left" && "right-full mr-2",
        side === "right" && "left-full ml-2",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
    >
      {children}
    </div>
  )
}

function DatePicker({ value, onChange, placeholder = "Select date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const formattedValue = value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formattedValue}
          placeholder={placeholder}
          className={cn(
            "flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm",
            className
          )}
          onFocus={() => setOpen(true)}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          {value ? (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(null)
              }}
            />
          ) : (
            <span className="text-xs text-muted-foreground">📅</span>
          )}
        </button>
      </div>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          selected={value || undefined}
          onChange={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { Popover, PopoverTrigger, PopoverContent, DatePicker }
