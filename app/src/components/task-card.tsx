"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, TeamMember } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
}

export function TaskCard({ task, members }: TaskCardProps) {
  const assignee = members.find((m) => m.id === task.assigneeId);
  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate) < new Date();
  const subtaskCount = task.subtasks?.length ?? 0;

  return (
    <Card className="mb-3 cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {task.title}
          </CardTitle>
          {assignee && (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[10px]">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {task.description && (
          <CardDescription className="mt-1 line-clamp-2 text-xs">
            {task.description}
          </CardDescription>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {task.dueDate && (
            <span
              className={`text-xs ${isOverdue ? "font-semibold text-red-600" : "text-muted-foreground"}`}
            >
              {isOverdue && "! "}
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}

          {subtaskCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {subtaskCount} subtask{subtaskCount !== 1 && "s"}
            </span>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
