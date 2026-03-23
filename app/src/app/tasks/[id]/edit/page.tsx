"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getTask, updateTask, getSubtasks, getAllAssignees } from "@/lib/store";
import { TaskStatus, STATUSES, STATUS_CONFIG } from "@/lib/types";

interface FormErrors {
  title?: string;
  dueDate?: string;
}

function EditTaskForm() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const task = getTask(taskId);
  const subtasks = getSubtasks(taskId);
  const assignees = getAllAssignees();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalTask = task;

  const hasSubtasks = subtasks.length > 0;
  const showSubtaskWarning = status === "DONE" && hasSubtasks && originalTask?.status !== "DONE";

  const assigneeOptions = useMemo(() => {
    const options = assignees.map((a) => ({ value: a, label: a }));
    return [{ value: "", label: "Unassigned" }, ...options];
  }, [assignees]);

  const statusOptions = STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }));

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Title is required";
    } else if (trimmedTitle.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        newErrors.dueDate = "Due date must be a valid date (YYYY-MM-DD)";
      } else {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
          newErrors.dueDate = "Due date must be a valid date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updates: Parameters<typeof updateTask>[1] = {};

      if (title.trim() !== originalTask?.title) {
        updates.title = title.trim();
      }
      if (description.trim() !== (originalTask?.description ?? "")) {
        updates.description = description.trim() || null;
      }
      if (dueDate !== (originalTask?.dueDate ?? "")) {
        updates.dueDate = dueDate || null;
      }
      if (assignee !== (originalTask?.assignee ?? "")) {
        updates.assignee = assignee || null;
      }
      if (status !== originalTask?.status) {
        updates.status = status;
      }

      if (Object.keys(updates).length > 0) {
        updateTask(taskId, updates);
      }

      router.push(`/tasks/${taskId}`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Title")) {
          setErrors({ title: error.message });
        } else if (error.message.includes("due date")) {
          setErrors({ dueDate: error.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/tasks/${taskId}`);
  };

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">Task not found</p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleCancel}>Back to Tasks</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
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
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-medium">
                    Due Date
                  </label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-destructive">{errors.dueDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="assignee" className="text-sm font-medium">
                    Assignee
                  </label>
                  <Select
                    id="assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    options={assigneeOptions}
                    placeholder="Select assignee"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    options={statusOptions}
                  />
                  {showSubtaskWarning && (
                    <p className="text-sm text-amber-600">
                      This will also mark all subtasks as Done
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-1 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditTaskForm />
    </Suspense>
  );
}
