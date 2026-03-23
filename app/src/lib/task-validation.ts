import { prisma } from "@/lib/prisma";
import { CreateTaskInput, UpdateTaskInput } from "./task-types";

export interface ValidationErrors {
  [field: string]: string;
}

async function hasCircularReference(
  taskId: string,
  newParentId: string
): Promise<boolean> {
  let currentId: string | null = newParentId;

  while (currentId) {
    if (currentId === taskId) {
      return true;
    }
    const task: { parentId: string | null } | null = await prisma.task.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!task) break;
    currentId = task.parentId;
  }

  return false;
}

export async function validateCreateTask(
  input: CreateTaskInput,
  errors: ValidationErrors
): Promise<boolean> {
  const trimmedTitle = input.title?.trim();

  if (!trimmedTitle) {
    errors.title = "Title is required";
  } else if (trimmedTitle.length === 0) {
    errors.title = "Title cannot be empty";
  } else if (trimmedTitle.length > 255) {
    errors.title = "Title must not exceed 255 characters";
  }

  if (input.due_date !== undefined && input.due_date !== null) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.due_date)) {
      errors.due_date = "Invalid date format. Use YYYY-MM-DD";
    } else {
      const date = new Date(input.due_date);
      if (isNaN(date.getTime())) {
        errors.due_date = "Invalid date";
      }
    }
  }

  if (input.assignee_id !== undefined && input.assignee_id !== null) {
    const user = await prisma.user.findUnique({
      where: { id: input.assignee_id },
    });
    if (!user) {
      errors.assignee_id = "User not found";
    }
  }

  if (input.parent_id !== undefined && input.parent_id !== null) {
    const parentTask = await prisma.task.findUnique({
      where: { id: input.parent_id },
    });
    if (!parentTask) {
      errors.parent_id = "Parent task not found";
    } else if (parentTask.parentId !== null) {
      errors.parent_id = "Cannot nest subtask under another subtask";
    } else {
      const hasCircular = await hasCircularReference("", input.parent_id);
      if (hasCircular) {
        errors.parent_id = "Circular reference detected";
      }
    }
  }

  return Object.keys(errors).length === 0;
}

export async function validateUpdateTask(
  taskId: string,
  input: UpdateTaskInput,
  errors: ValidationErrors
): Promise<boolean> {
  const trimmedTitle = input.title?.trim();

  if (input.title !== undefined) {
    if (!trimmedTitle) {
      errors.title = "Title is required";
    } else if (trimmedTitle.length === 0) {
      errors.title = "Title cannot be empty";
    } else if (trimmedTitle.length > 255) {
      errors.title = "Title must not exceed 255 characters";
    }
  }

  if (input.due_date !== undefined && input.due_date !== null) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.due_date)) {
      errors.due_date = "Invalid date format. Use YYYY-MM-DD";
    } else {
      const date = new Date(input.due_date);
      if (isNaN(date.getTime())) {
        errors.due_date = "Invalid date";
      }
    }
  }

  if (input.assignee_id !== undefined && input.assignee_id !== null) {
    const user = await prisma.user.findUnique({
      where: { id: input.assignee_id },
    });
    if (!user) {
      errors.assignee_id = "User not found";
    }
  }

  if (input.parent_id !== undefined && input.parent_id !== null) {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { parentId: true, _count: { select: { subtasks: true } } },
    });

    if (currentTask?.parentId !== null) {
      errors.parent_id = "A subtask cannot have its own subtask";
    } else if (input.parent_id === taskId) {
      errors.parent_id = "Cannot set parent_id to self";
    } else {
      const parentTask = await prisma.task.findUnique({
        where: { id: input.parent_id },
      });
      if (!parentTask) {
        errors.parent_id = "Parent task not found";
      } else if (parentTask.parentId !== null) {
        errors.parent_id = "Cannot nest subtask under another subtask";
      } else if ((currentTask?._count?.subtasks ?? 0) > 0) {
        errors.parent_id = "Cannot make a task with subtasks into a subtask";
      } else {
        const hasCircular = await hasCircularReference(taskId, input.parent_id);
        if (hasCircular) {
          errors.parent_id = "Circular reference detected";
        }
      }
    }
  }

  return Object.keys(errors).length === 0;
}
