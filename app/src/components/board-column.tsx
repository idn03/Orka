"use client";

import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import type { Task, TaskStatus, TeamMember } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/types";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  members: TeamMember[];
}

export function BoardColumn({ status, tasks, members }: BoardColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{config.label}</h2>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} members={members} />
          ))
        )}
      </div>
    </div>
  );
}
