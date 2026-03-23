"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createTask, getTask, getAllAssignees } from "@/lib/store";

interface FormErrors {
  title?: string;
  dueDate?: string;
}

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId");

  const parentTask = parentId ? getTask(parentId) : null;
  const assignees = getAllAssignees();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assigneeOptions = useMemo(() => {
    const options = assignees.map((a) => ({ value: a, label: a }));
    return [{ value: "", label: "Unassigned" }, ...options];
  }, [assignees]);

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
      const newTask = createTask({
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
        assignee: assignee || null,
        parentId: parentId,
      });

      router.push(`/tasks/${newTask.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ title: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (parentId) {
      router.push(`/tasks/${parentId}`);
    } else {
      router.push("/tasks");
    }
  };

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
          {parentTask && (
            <div className="mb-4 text-sm text-muted-foreground">
              Creating subtask of:{" "}
              <Link
                href={`/tasks/${parentTask.id}`}
                className="font-medium hover:underline"
              >
                {parentTask.title}
              </Link>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{parentId ? "Add Subtask" : "Create New Task"}</CardTitle>
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
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="mr-1 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Task"}
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

export default function NewTaskPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewTaskForm />
    </Suspense>
  );
}
