import { Task, TaskStatus, STORAGE_KEY } from "./types";
import { SEED_TASKS } from "./seed-data";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  assignee?: string | null;
  parentId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: string | null;
  assignee?: string | null;
  parentId?: string | null;
}

export interface QueryFilters {
  search?: string;
  status?: TaskStatus;
  assignee?: string;
  due?: "overdue" | "today" | "this_week" | "none";
  parentId?: string | null;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getStorage(): Storage | null {
  if (!isClient()) return null;
  return window.localStorage;
}

function loadTasks(): Task[] {
  const storage = getStorage();
  if (!storage) return [];
  const data = storage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function initializeSeedData(): Task[] {
  const tasks = [...SEED_TASKS];
  saveTasks(tasks);
  return tasks;
}

export function getAllTasks(): Task[] {
  const tasks = loadTasks();
  if (tasks.length === 0) {
    return initializeSeedData();
  }
  return tasks;
}

export function getTask(id: string): Task | undefined {
  const tasks = getAllTasks();
  return tasks.find((t) => t.id === id);
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("Title is required and cannot be whitespace-only");
  }
  if (trimmed.length > 255) {
    throw new Error("Title must be 255 characters or less");
  }
  return trimmed;
}

function validateParentId(parentId: string | null | undefined, tasks: Task[], excludeId?: string): void {
  if (!parentId) return;

  const parent = tasks.find((t) => t.id === parentId);
  if (!parent) {
    throw new Error("Parent task does not exist");
  }

  const isSubtask = parent.parentId !== null;
  if (isSubtask) {
    throw new Error("Cannot nest subtasks under subtasks (max 1 level)");
  }

  const hasSubtasks = tasks.some((t) => t.parentId === parentId && t.id !== excludeId);
  if (hasSubtasks) {
    throw new Error("A task with subtasks cannot be made into a subtask");
  }
}

export function createTask(data: CreateTaskInput): Task {
  const tasks = getAllTasks();
  const now = new Date().toISOString();

  const title = validateTitle(data.title);

  if (data.parentId) {
    validateParentId(data.parentId, tasks);
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    description: data.description ?? null,
    status: "TODO",
    dueDate: data.dueDate ?? null,
    parentId: data.parentId ?? null,
    assignee: data.assignee ?? null,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

function getSubtasksSync(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((t) => t.parentId === parentId);
}

export function updateTask(id: string, data: Partial<UpdateTaskInput>): Task {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new Error("Task not found");
  }

  const task = tasks[index];

  if (data.parentId !== undefined) {
    const tasksWithoutCurrent = tasks.filter((t) => t.id !== id);
    validateParentId(data.parentId, tasksWithoutCurrent, id);
  }

  if (data.title !== undefined) {
    data.title = validateTitle(data.title);
  }

  const wasDone = task.status === "DONE";
  const isDone = data.status ?? task.status;

  Object.assign(task, data, { updatedAt: new Date().toISOString() });

  if (!wasDone && isDone === "DONE") {
    const subtasks = getSubtasksSync(tasks, id);
    const now = new Date().toISOString();
    subtasks.forEach((subtask) => {
      if (subtask.status !== "DONE") {
        subtask.status = "DONE";
        subtask.updatedAt = now;
      }
    });
  }

  tasks[index] = task;
  saveTasks(tasks);
  return task;
}

export function deleteTask(id: string): void {
  const tasks = getAllTasks();
  const toDelete = new Set<string>();

  const task = tasks.find((t) => t.id === id);
  if (task) {
    toDelete.add(id);
    const subtasks = getSubtasksSync(tasks, id);
    subtasks.forEach((subtask) => toDelete.add(subtask.id));
  }

  const remaining = tasks.filter((t) => !toDelete.has(t.id));
  saveTasks(remaining);
}

function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

function isToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

function isThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  return due >= today && due <= endOfWeek;
}

export function queryTasks(filters: QueryFilters): Task[] {
  let tasks = getAllTasks();

  if (filters.search !== undefined && filters.search.trim() !== "") {
    const search = filters.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
  }

  if (filters.status !== undefined) {
    tasks = tasks.filter((t) => t.status === filters.status);
  }

  if (filters.assignee !== undefined) {
    tasks = tasks.filter((t) => t.assignee === filters.assignee);
  }

  if (filters.due !== undefined) {
    tasks = tasks.filter((t) => {
      switch (filters.due) {
        case "overdue":
          return isOverdue(t.dueDate, t.status);
        case "today":
          return isToday(t.dueDate);
        case "this_week":
          return isThisWeek(t.dueDate);
        case "none":
          return t.dueDate === null;
        default:
          return true;
      }
    });
  }

  if (filters.parentId !== undefined) {
    tasks = tasks.filter((t) => t.parentId === filters.parentId);
  }

  return tasks;
}

export function getSubtasks(parentId: string): Task[] {
  return queryTasks({ parentId });
}

export function getAllAssignees(): string[] {
  const tasks = getAllTasks();
  const assignees = new Set<string>();
  tasks.forEach((t) => {
    if (t.assignee) {
      assignees.add(t.assignee);
    }
  });
  return Array.from(assignees).sort();
}
