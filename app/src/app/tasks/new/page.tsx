"use client";

import React, { useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { LoadingFallback } from "@/components/loading-fallback";
import { createTask, getTask, getAllAssignees } from "@/lib/store";

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId");

  const parentTask = parentId ? getTask(parentId) : null;
  const assignees = useMemo(() => getAllAssignees(), []);

  const handleSubmit = async (data: {
    title: string;
    description: string | null;
    dueDate: string | null;
    assignee: string | null;
  }) => {
    const newTask = createTask({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      assignee: data.assignee,
      parentId: parentId,
    });

    router.push(`/tasks/${newTask.id}`);
  };

  const handleCancel = () => {
    if (parentId) {
      router.push(`/tasks/${parentId}`);
    } else {
      router.push("/tasks");
    }
  };

  const handleBackClick = () => {
    handleCancel();
  };

  return (
    <PageShell>
      <PageHeader title="Orka Tasks" onBackClick={handleBackClick} />

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

          <TaskForm
            mode="create"
            parentId={parentId}
            parentTask={parentTask}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            assignees={assignees}
          />
        </div>
      </main>
    </PageShell>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewTaskForm />
    </Suspense>
  );
}
