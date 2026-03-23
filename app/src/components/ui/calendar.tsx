"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  selected?: string | null
  onChange?: (date: string | null) => void
  className?: string
}

function Calendar({ selected, onChange, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selected ? new Date(selected) : new Date()
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = selected ? new Date(selected) : null
  if (selectedDate) {
    selectedDate.setHours(0, 0, 0, 0)
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    const formatted = clickedDate.toISOString().split("T")[0]
    onChange?.(formatted)
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const dayDate = new Date(year, month, day)
    dayDate.setHours(0, 0, 0, 0)
    return dayDate.getTime() === selectedDate.getTime()
  }

  const isToday = (day: number) => {
    const dayDate = new Date(year, month, day)
    dayDate.setHours(0, 0, 0, 0)
    return dayDate.getTime() === today.getTime()
  }

  const days: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={previousMonth}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div
            key={name}
            className="h-8 w-full flex items-center justify-center text-xs text-muted-foreground font-medium"
          >
            {name}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="h-8 w-full">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-8 w-full flex items-center justify-center rounded-md text-sm",
                  isSelected(day) && "bg-primary text-primary-foreground",
                  !isSelected(day) && isToday(day) && "border border-primary",
                  !isSelected(day) && !isToday(day) && "hover:bg-muted"
                )}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Calendar }
