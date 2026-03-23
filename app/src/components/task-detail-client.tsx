"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Clock,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
}

interface Subtask {
  id: string
  title: string
  status: string
  due_date: string | null
  assignee_id: string | null
  assignee: User | null
}

interface TaskResponse {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  parent_id: string | null
  assignee_id: string | null
  creator_id: string
  created_at: string
  updated_at: string
  assignee: User | null
  creator?: User
  subtasks?: Subtask[]
  parent?: { id: string; title: string } | null
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

const STATUS_CONFIG: Record<string, { label: string }> = {
  TODO: { label: "To Do" },
  IN_PROGRESS: { label: "In Progress" },
  IN_REVIEW: { label: "In Review" },
  DONE: { label: "Done" },
}

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
]

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  return formatDate(dateStr)
}

interface TaskDetailClientProps {
  taskId: string
  currentUserId: string
}

export function TaskDetailClient({ taskId, currentUserId }: TaskDetailClientProps) {
  const router = useRouter()
  const [task, setTask] = useState<TaskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchTask = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setTask(data)
      } else {
        const data = await res.json()
        setError(data.errors?.id || data.errors?.auth || "Failed to load task")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setTask(data)
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        if (task?.parent_id) {
          router.push(`/tasks/${task.parent_id}`)
        } else {
          router.push("/tasks")
        }
      }
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive">{error || "Task not found"}</p>
        <Link href="/tasks" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    )
  }

  const taskOverdue = isOverdue(task.due_date, task.status)
  const assigneeName = task.assignee?.name || "Unassigned"
  const assigneeInitials = getInitials(assigneeName)
  const creatorName = task.creator?.name || "Unknown"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={task.parent_id ? `/tasks/${task.parent_id}` : "/tasks"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">{task.title}</h1>
        <Link href={`/tasks/${taskId}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {task.subtasks && task.subtasks.length > 0 ? "this task?" : "this subtask?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {task.subtasks && task.subtasks.length > 0
                  ? "This will also delete all subtasks."
                  : "Are you sure you want to delete this subtask?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Select
              options={statusOptions}
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
            />
            {updatingStatus && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Badge
                className={getStatusBadgeClass(task.status)}
                variant={getStatusBadgeVariant(task.status)}
              >
                {STATUS_CONFIG[task.status]?.label}
              </Badge>
            </div>

            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span
                  className={`text-sm ${
                    taskOverdue ? "text-destructive font-medium" : ""
                  }`}
                >
                  {taskOverdue && "⚠️ "}
                  Due: {formatDate(task.due_date)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Assignee: </span>
                <Avatar size="sm" className="inline-flex mx-1">
                  <AvatarFallback className="text-xs bg-muted">
                    {assigneeInitials}
                  </AvatarFallback>
                </Avatar>
                {assigneeName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Created by: </span>
                {creatorName}
              </span>
            </div>
          </div>

          {task.description && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="border-t pt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Created {formatRelativeTime(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {formatRelativeTime(task.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {task.parent_id && task.parent && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Subtask of:{" "}
              <Link
                href={`/tasks/${task.parent.id}`}
                className="font-medium hover:underline"
              >
                {task.parent.title}
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {!task.parent_id && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Subtasks
                {task.subtasks && task.subtasks.length > 0 && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({task.subtasks.length})
                  </span>
                )}
              </CardTitle>
              <Link href={`/tasks/new?parent_id=${taskId}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Add Subtask
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!task.subtasks || task.subtasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No subtasks</p>
            ) : (
              <div className="space-y-3">
                {task.subtasks.map((subtask) => {
                  const subtaskAssigneeName = subtask.assignee?.name || "Unassigned"
                  const subtaskAssigneeInitials = getInitials(subtaskAssigneeName)
                  const subtaskOverdue = isOverdue(subtask.due_date, subtask.status)

                  return (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Badge
                        className={getStatusBadgeClass(subtask.status)}
                        variant={getStatusBadgeVariant(subtask.status)}
                      >
                        {STATUS_CONFIG[subtask.status]?.label}
                      </Badge>
                      <Link
                        href={`/tasks/${subtask.id}`}
                        className="flex-1 font-medium hover:underline"
                      >
                        {subtask.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar size="sm">
                          <AvatarFallback className="text-xs bg-muted">
                            {subtaskAssigneeInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{subtaskAssigneeName}</span>
                      </div>
                      {subtask.due_date && (
                        <span
                          className={`text-sm ${
                            subtaskOverdue ? "text-destructive font-medium" : ""
                          }`}
                        >
                          {subtaskOverdue && "⚠️ "}
                          {formatDate(subtask.due_date)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
