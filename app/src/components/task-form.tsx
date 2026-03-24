"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Task, TaskStatus, STATUSES, STATUS_CONFIG } from "@/lib/types";
import { validateTaskForm, FormErrors } from "@/lib/validation";

interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: {
    title: string;
    description: string | null;
    dueDate: string | null;
    assignee: string | null;
    status?: TaskStatus;
  };
  parentId?: string | null;
  parentTask?: Task | null;
  onSubmit: (data: {
    title: string;
    description: string | null;
    dueDate: string | null;
    assignee: string | null;
    status?: TaskStatus;
  }) => Promise<void>;
  onCancel: () => void;
  assignees: string[];
  isSubmitting?: boolean;
}

export function TaskForm({
  mode,
  initialValues,
  parentId,
  parentTask,
  onSubmit,
  onCancel,
  assignees,
  isSubmitting: externalIsSubmitting,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [assignee, setAssignee] = useState(initialValues?.assignee ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "TODO");
  const [errors, setErrors] = useState<FormErrors>({});
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting;

  const assigneeOptions = useMemo(() => {
    const options = assignees.map((a) => ({ value: a, label: a }));
    return [{ value: "", label: "Unassigned" }, ...options];
  }, [assignees]);

  const statusOptions = STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTaskForm(title, dueDate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setInternalIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
        assignee: assignee || null,
        status: mode === "edit" ? status : undefined,
      });
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? parentId
              ? "Add Subtask"
              : "Create New Task"
            : "Edit Task"}
        </CardTitle>
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

          {mode === "edit" && (
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
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === "create"
              ? isSubmitting
                ? "Creating..."
                : "Create Task"
              : isSubmitting
                ? "Saving..."
                : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
