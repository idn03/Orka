"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Plus, AlertTriangle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
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
  subtasks?: Array<{
    id: string
    title: string
    status: string
    due_date: string | null
    assignee_id: string | null
    assignee: User | null
  }>
  parent?: { id: string; title: string } | null
}

interface TaskFormProps {
  task?: TaskResponse
  parentId?: string | null
  parentTitle?: string | null
  isEdit?: boolean
  taskId?: string
}

interface FormErrors {
  [key: string]: string
}

export function TaskForm({ task, parentId, parentTitle, isEdit, taskId }: TaskFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueDate, setDueDate] = useState<string | null>(task?.due_date || null)
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee_id || "")
  const [status, setStatus] = useState(task?.status || "TODO")
  const [currentParentId] = useState(parentId || task?.parent_id || null)
  const [currentParentTitle, setCurrentParentTitle] = useState<string | null>(parentTitle || task?.parent?.title || null)
  const [parentError, setParentError] = useState(false)
  const [formDisabled, setFormDisabled] = useState(false)

  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [showStatusWarning, setShowStatusWarning] = useState(false)
  const [initialValues, setInitialValues] = useState<{
    title: string
    description: string
    dueDate: string | null
    assigneeId: string
    status: string
  } | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        }
      } catch {
        // ignore
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (parentId && !parentTitle && !task) {
      const fetchParent = async () => {
        try {
          const res = await fetch(`/api/tasks/${parentId}`)
          if (res.ok) {
            const data = await res.json()
            setCurrentParentTitle(data.title)
          } else {
            setParentError(true)
            setFormDisabled(true)
          }
        } catch {
          setParentError(true)
          setFormDisabled(true)
        }
      }

      fetchParent()
    }
  }, [parentId, parentTitle, task])

  useEffect(() => {
    if (isEdit && task) {
      setInitialValues({
        title: task.title,
        description: task.description || "",
        dueDate: task.due_date,
        assigneeId: task.assignee_id || "",
        status: task.status,
      })
    }
  }, [isEdit, task])

  const getChangedFields = useCallback(() => {
    if (!initialValues || !isEdit) return null

    const changed: Record<string, unknown> = {}

    if (title !== initialValues.title) {
      changed.title = title.trim()
    }
    if (description !== (initialValues.description || "")) {
      changed.description = description || null
    }
    if (dueDate !== (initialValues.dueDate || null)) {
      changed.due_date = dueDate
    }
    if (assigneeId !== (initialValues.assigneeId || "")) {
      changed.assignee_id = assigneeId || null
    }
    if (status !== initialValues.status) {
      changed.status = status
    }

    if (Object.keys(changed).length === 0) {
      return null
    }

    return changed
  }, [initialValues, title, description, dueDate, assigneeId, status, isEdit])

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    if (newStatus === "DONE" && task?.subtasks && task.subtasks.length > 0) {
      setShowStatusWarning(true)
    } else {
      setShowStatusWarning(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const clientErrors: FormErrors = {}
    if (!title.trim()) {
      clientErrors.title = "Title is required"
    }
    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dueDate)) {
        clientErrors.due_date = "Invalid date format"
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setSubmitting(true)

    try {
      const endpoint = isEdit ? `/api/tasks/${taskId}` : "/api/tasks"
      const method = isEdit ? "PATCH" : "POST"

      const body: Record<string, unknown> = {}
      if (isEdit) {
        const changedFields = getChangedFields()
        if (!changedFields) {
          router.push(`/tasks/${taskId}`)
          return
        }
        Object.assign(body, changedFields)
      } else {
        body.title = title.trim()
        body.description = description || null
        body.due_date = dueDate
        body.assignee_id = assigneeId || null
        body.parent_id = currentParentId
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        }
        setSubmitting(false)
        return
      }

      if (isEdit) {
        router.push(`/tasks/${taskId}`)
      } else {
        router.push(`/tasks/${data.id}`)
      }
    } catch {
      setErrors({ auth: "An error occurred. Please try again." })
      setSubmitting(false)
    }
  }

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({
      value: u.id,
      label: u.name,
    })),
  ]

  const statusOptions = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "DONE", label: "Done" },
  ]

  const handleCancel = () => {
    if (isEdit && taskId) {
      router.push(`/tasks/${taskId}`)
    } else if (currentParentId) {
      router.push(`/tasks/${currentParentId}`)
    } else {
      router.push("/tasks")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Task" : parentId ? "Create Subtask" : "Create Task"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {parentError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>Parent task not found. Cannot create subtask.</p>
            </div>
          )}

          {currentParentTitle && !parentError && (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Creating subtask of: </span>
              <Link
                href={`/tasks/${currentParentId}`}
                className="font-medium hover:underline"
              >
                {currentParentTitle}
              </Link>
            </div>
          )}

          {showStatusWarning && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>This will also mark all subtasks as Done</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              disabled={formDisabled || submitting}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={4}
              disabled={formDisabled || submitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="due_date" className="text-sm font-medium">
              Due Date
            </label>
            <DatePicker
              value={dueDate}
              onChange={(date) => {
                setDueDate(date)
                if (errors.due_date) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.due_date
                    return next
                  })
                }
              }}
              placeholder="Select due date"
              className={errors.due_date ? "border-destructive" : ""}
            />
            {errors.due_date && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.due_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="assignee_id" className="text-sm font-medium">
              Assignee
            </label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading users...</span>
              </div>
            ) : (
              <Select
                id="assignee_id"
                options={assigneeOptions}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={formDisabled || submitting}
              />
            )}
            {errors.assignee_id && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.assignee_id}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                id="status"
                options={statusOptions}
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={formDisabled || submitting}
              />
              {errors.status && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.status}
                </p>
              )}
            </div>
          )}

          {errors.auth && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{errors.auth}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={formDisabled || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isEdit ? "Save Changes" : "Create Task"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
