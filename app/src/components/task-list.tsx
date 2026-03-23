"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TaskResponse, TaskStatus } from "@/lib/task-types"
import { TaskListItem } from "@/components/task-list-item"
import { TaskFilters } from "@/components/task-filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Loader2, AlertTriangle } from "lucide-react"

interface TaskListProps {
  currentUserId: string
  initialUsers: Array<{ id: string; name: string; email: string }>
}

export function TaskList({ currentUserId, initialUsers }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [users] = useState(initialUsers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const [filters, setFilters] = useState({
    status: (searchParams.get("status") as TaskStatus | "") || "",
    assignee_id: searchParams.get("assignee_id") || "",
    due: searchParams.get("due") || "",
  })

  const debounceRef = useRef<NodeJS.Timeout>()

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams()
    params.set("parent_id", "null")

    if (search) {
      params.set("search", search)
    }
    if (filters.status) {
      params.set("status", filters.status)
    }
    if (filters.assignee_id) {
      params.set("assignee_id", filters.assignee_id)
    }
    if (filters.due) {
      params.set("due", filters.due)
    }

    return params.toString()
  }, [search, filters])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryString = buildQueryString()
      const response = await fetch(`/api/tasks?${queryString}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.errors?.auth || "Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [buildQueryString])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (search) {
        params.set("search", search)
      } else {
        params.delete("search")
      }

      const newUrl = params.toString() ? `/tasks?${params.toString()}` : "/tasks"
      router.replace(newUrl, { scroll: false })
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [search, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))

    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const newUrl = params.toString() ? `/tasks?${params.toString()}` : "/tasks"
    router.replace(newUrl, { scroll: false })
  }

  const clearSearch = () => {
    setSearch("")
  }

  const hasFilters =
    search || filters.status || filters.assignee_id || filters.due

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <TaskFilters
        users={users}
        currentUserId={currentUserId}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          {hasFilters ? (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No tasks match your filters.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No tasks yet. Create your first task!
              </p>
            </>
          )}
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
