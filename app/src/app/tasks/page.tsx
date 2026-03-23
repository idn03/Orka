"use client";

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getAllTasks,
  getAllAssignees,
  queryTasks,
  getSubtasks,
} from "@/lib/store";
import { TaskStatus, STATUS_CONFIG, STATUSES } from "@/lib/types";

type DueFilter = "all" | "overdue" | "today" | "this_week" | "none";

function subscribe() {
  return () => {};
}

function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSubtaskCount(parentId: string): number {
  return getSubtasks(parentId).length;
}

export default function TaskListPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const assignees = useMemo(() => getAllAssignees(), [hydrated]);

  const filteredTasks = useMemo(() => {
    const filters: Parameters<typeof queryTasks>[0] = {
      parentId: null,
    };

    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch;
    }

    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    if (assigneeFilter !== "all") {
      filters.assignee = assigneeFilter;
    }

    if (dueFilter !== "all") {
      filters.due = dueFilter as "overdue" | "today" | "this_week" | "none";
    }

    return queryTasks(filters);
  }, [debouncedSearch, statusFilter, assigneeFilter, dueFilter, hydrated]);

  const hasTasks = useMemo(() => {
    const allTasks = getAllTasks();
    return allTasks.length > 0;
  }, [hydrated]);

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const handleCreateTask = () => {
    router.push("/tasks/new");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  const statusOptions = [
    { value: "all", label: "All" },
    ...STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
  ];

  const assigneeOptions = [
    { value: "all", label: "All" },
    ...assignees.map((a) => ({ value: a, label: a })),
  ];

  const dueOptions = [
    { value: "all", label: "All" },
    { value: "overdue", label: "Overdue" },
    { value: "today", label: "Due today" },
    { value: "this_week", label: "Due this week" },
    { value: "none", label: "No due date" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
              className="w-36"
            />
            <Select
              options={assigneeOptions}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-36"
            />
            <Select
              options={dueOptions}
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value as DueFilter)}
              className="w-40"
            />
          </div>

          {!hasTasks ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
              <Button onClick={handleCreateTask} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No tasks match your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                const subtaskCount = getSubtaskCount(task.id);

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block rounded-lg border bg-background p-4 hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{task.title}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="secondary">
                            {STATUS_CONFIG[task.status].label}
                          </Badge>
                          <span>{task.assignee || "Unassigned"}</span>
                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                overdue ? "text-red-600" : ""
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              {formatDueDate(task.dueDate)}
                              {overdue && " (Overdue)"}
                            </span>
                          )}
                          {subtaskCount > 0 && (
                            <span className="text-muted-foreground">
                              {subtaskCount} subtask{subtaskCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
