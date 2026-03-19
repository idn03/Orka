"use client";

import { BoardColumn } from "./board-column";
import type { Task, TeamMember } from "@/lib/types";
import { STATUSES } from "@/lib/types";

interface KanbanBoardProps {
  tasks: Task[];
  members: TeamMember[];
}

export function KanbanBoard({ tasks, members }: KanbanBoardProps) {
  // Only show top-level tasks on the board (subtasks appear within task detail)
  const topLevelTasks = tasks.filter((t) => !t.parentId);

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {STATUSES.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          tasks={topLevelTasks.filter((t) => t.status === status)}
          members={members}
        />
      ))}
    </div>
  );
}
