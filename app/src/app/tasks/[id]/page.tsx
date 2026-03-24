"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Pencil, Trash2, Plus, Calendar, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { SubtaskRow } from "@/components/subtask-row";
import { TaskNotFound } from "@/components/task-not-found";
import { getTask, getSubtasks, updateTask, deleteTask } from "@/lib/store";
import { Task, TaskStatus, STATUS_CONFIG, STATUSES } from "@/lib/types";
import { isOverdue, formatDate, formatRelativeTime } from "@/lib/date-utils";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const loadedTask = getTask(taskId);
  const task = loadedTask || null;
  
  const loadedSubtasks = task ? getSubtasks(taskId) : [];
  const subtasks = loadedSubtasks;
  
  const parentTask = task?.parentId ? getTask(task.parentId) : null;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusWarning, setShowStatusWarning] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;

    if (
      newStatus === "DONE" &&
      task.status !== "DONE" &&
      subtasks.length > 0
    ) {
      setPendingStatus(newStatus);
      setShowStatusWarning(true);
    } else {
      applyStatusChange(newStatus);
    }
  };

  const applyStatusChange = (status: TaskStatus) => {
    if (!task) return;
    updateTask(task.id, { status });
    setShowStatusWarning(false);
    setPendingStatus(null);
  };

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      applyStatusChange(pendingStatus);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    if (task.parentId) {
      router.push(`/tasks/${task.parentId}`);
    } else {
      router.push("/tasks");
    }
  };

  if (!task) {
    return <TaskNotFound />;
  }

  const taskOverdue = isOverdue(task.dueDate, task.status);
  const isSubtask = task.parentId !== null;
  const backLink = isSubtask && task.parentId ? `/tasks/${task.parentId}` : "/tasks";

  return (
    <PageShell>
      <PageHeader title="Orka Tasks" backLink={backLink} />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          {isSubtask && parentTask && (
            <div className="mb-4 text-sm text-muted-foreground">
              Subtask of:{" "}
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/tasks/${task.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {subtasks.length > 0
                            ? "This will also delete all subtasks."
                            : "This action cannot be undone."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>

              {task.description && (
                <div>
                  <label className="text-sm font-medium">Description:</label>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assignee:</span>
                  <span className="text-muted-foreground">
                    {task.assignee || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Due Date:</span>
                  <span
                    className={
                      taskOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                    }
                  >
                    {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                    {taskOverdue && " (Overdue)"}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Created: {formatRelativeTime(task.createdAt)}
                </p>
                <p>
                  Updated: {formatRelativeTime(task.updatedAt)}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4">
              {!isSubtask && (
                <div className="w-full">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Subtasks ({subtasks.length})
                    </h3>
                    <Link href={`/tasks/new?parentId=${task.id}`}>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Subtask
                      </Button>
                    </Link>
                  </div>

                  {subtasks.length === 0 ? (
                    <p className="text-muted-foreground">No subtasks</p>
                  ) : (
                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <SubtaskRow key={subtask.id} task={subtask} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>

      <AlertDialog open={showStatusWarning} onOpenChange={setShowStatusWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark all subtasks as Done?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {subtasks.length} subtask(s) as Done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
