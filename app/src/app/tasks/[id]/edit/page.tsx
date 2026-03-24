"use client";

import React, { useMemo, Suspense, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { TaskNotFound } from "@/components/task-not-found";
import { LoadingFallback } from "@/components/loading-fallback";
import { getTask, updateTask, getSubtasks, getAllAssignees } from "@/lib/store";
import { TaskStatus } from "@/lib/types";

function EditTaskForm() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const task = getTask(taskId);
  const subtasks = getSubtasks(taskId);
  const assignees = useMemo(() => getAllAssignees(), []);

  const originalTask = task;

  const hasSubtasks = subtasks.length > 0;
  const [showSubtaskWarning, setShowSubtaskWarning] = useState(
    task?.status !== "DONE"
  );

  const handleSubmit = async (data: {
    title: string;
    description: string | null;
    dueDate: string | null;
    assignee: string | null;
    status?: TaskStatus;
  }) => {
    if (!originalTask) return;

    const updates: Parameters<typeof updateTask>[1] = {};

    if (data.title !== originalTask.title) {
      updates.title = data.title;
    }
    if (data.description !== (originalTask.description ?? "")) {
      updates.description = data.description;
    }
    if (data.dueDate !== (originalTask.dueDate ?? "")) {
      updates.dueDate = data.dueDate;
    }
    if (data.assignee !== (originalTask.assignee ?? "")) {
      updates.assignee = data.assignee;
    }
    if (data.status && data.status !== originalTask.status) {
      updates.status = data.status;
    }

    if (Object.keys(updates).length > 0) {
      updateTask(taskId, updates);
    }

    router.push(`/tasks/${taskId}`);
  };

  const handleCancel = () => {
    router.push(`/tasks/${taskId}`);
  };

  const handleBackClick = () => {
    handleCancel();
  };

  if (!task) {
    return <TaskNotFound backLink="/tasks" />;
  }

  return (
    <PageShell>
      <PageHeader title="Orka Tasks" onBackClick={handleBackClick} />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <TaskForm
            mode="edit"
            initialValues={{
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              assignee: task.assignee,
              status: task.status,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            assignees={assignees}
          />
        </div>
      </main>
    </PageShell>
  );
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditTaskForm />
    </Suspense>
  );
}
