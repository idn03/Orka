"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { TaskResponse, STATUS_CONFIG } from "@/lib/task-types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TaskListItemProps {
  task: TaskResponse
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "TODO":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "IN_REVIEW":
      return "outline"
    case "DONE":
      return "default"
    default:
      return "secondary"
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "TODO":
      return "bg-gray-100 text-gray-700"
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700"
    case "IN_REVIEW":
      return "bg-yellow-100 text-yellow-700"
    case "DONE":
      return "bg-green-100 text-green-700"
    default:
      return ""
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "DONE") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  return due < today
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return ""
  const date = new Date(dueDate)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function TaskListItem({ task }: TaskListItemProps) {
  const overdue = isOverdue(task.due_date, task.status)
  const statusConfig = STATUS_CONFIG[task.status]
  const assigneeName = task.assignee?.name || "Unassigned"
  const initials = getInitials(assigneeName)

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <Link
          href={`/tasks/${task.id}`}
          className="text-base font-medium hover:underline hover:text-primary"
        >
          {task.title}
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge
            className={getStatusBadgeClass(task.status)}
            variant={getStatusBadgeVariant(task.status)}
          >
            {statusConfig.label}
          </Badge>

          <div className="flex items-center gap-1.5">
            <Avatar size="sm">
              <AvatarFallback className="text-xs bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span>{assigneeName}</span>
          </div>

          {task.due_date && (
            <div
              className={`flex items-center gap-1 ${
                overdue ? "text-destructive font-medium" : ""
              }`}
            >
              {overdue && <AlertCircle className="h-3.5 w-3.5" />}
              <span>{formatDueDate(task.due_date)}</span>
            </div>
          )}

          {task.subtask_count !== undefined && task.subtask_count > 0 && (
            <span className="text-muted-foreground">
              {task.subtask_count} subtask
              {task.subtask_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
