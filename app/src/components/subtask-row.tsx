import Link from "next/link";
import { Task } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { isOverdue, formatDate } from "@/lib/date-utils";

interface SubtaskRowProps {
  task: Task;
}

export function SubtaskRow({ task }: SubtaskRowProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex flex-1 items-center gap-3">
        <Link
          href={`/tasks/${task.id}`}
          className="flex-1 font-medium hover:underline"
        >
          {task.title}
        </Link>
        <StatusBadge status={task.status} />
      </div>
      <div className="flex items-center gap-4">
        {task.assignee ? (
          <span className="text-sm text-muted-foreground">
            {task.assignee}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
        {task.dueDate && (
          <span
            className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
          >
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
