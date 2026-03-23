"use client"

import { TaskStatus } from "@/lib/task-types"
import { Select } from "@/components/ui/select"

interface TaskFiltersProps {
  users: Array<{ id: string; name: string; email: string }>
  currentUserId: string
  filters: {
    status: TaskStatus | ""
    assignee_id: string
    due: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function TaskFilters({
  users,
  currentUserId,
  filters,
  onFilterChange,
}: TaskFiltersProps) {
  const statusOptions = [
    { value: "", label: "All" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "DONE", label: "Done" },
  ]

  const assigneeOptions = [
    { value: "", label: "All" },
    { value: currentUserId, label: "Assigned to me" },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ]

  const dueOptions = [
    { value: "", label: "All" },
    { value: "overdue", label: "Overdue" },
    { value: "today", label: "Due today" },
    { value: "this_week", label: "Due this week" },
    { value: "none", label: "No due date" },
  ]

  const hasActiveFilters =
    filters.status !== "" ||
    filters.assignee_id !== "" ||
    filters.due !== ""

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 ${
        hasActiveFilters ? "border-ring" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="w-32"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Assignee:</span>
        <Select
          options={assigneeOptions}
          value={filters.assignee_id}
          onChange={(e) => onFilterChange("assignee_id", e.target.value)}
          className="w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Due:</span>
        <Select
          options={dueOptions}
          value={filters.due}
          onChange={(e) => onFilterChange("due", e.target.value)}
          className="w-36"
        />
      </div>
    </div>
  )
}
