import { Task, User, TaskStatus } from "@/generated/prisma";

export type TaskWithRelations = Task & {
  assignee: Pick<User, "id" | "name" | "email"> | null;
  creator: Pick<User, "id" | "name" | "email">;
  subtasks?: TaskWithRelations[];
  _count?: { subtasks: number };
};

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  parent_id: string | null;
  assignee_id: string | null;
  creator_id: string;
  created_at: string;
  updated_at: string;
  subtask_count?: number;
  assignee: { id: string; name: string; email: string } | null;
  creator?: { id: string; name: string; email: string };
  subtasks?: TaskResponse[];
  parent?: { id: string; title: string } | null;
}

export interface CreateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  assignee_id?: string | null;
  parent_id?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  due_date?: string | null;
  assignee_id?: string | null;
  parent_id?: string | null;
}

export function transformTask(task: TaskWithRelations): TaskResponse {
  const base = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    due_date: task.dueDate ? formatDate(task.dueDate) : null,
    parent_id: task.parentId,
    assignee_id: task.assigneeId,
    creator_id: task.creatorId,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    subtask_count: task._count?.subtasks,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
        }
      : null,
  };

  if (task.creator) {
    return {
      ...base,
      creator: {
        id: task.creator.id,
        name: task.creator.name,
        email: task.creator.email,
      },
    };
  }

  return base;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
