export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  parentId: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  TODO: { label: "To Do", color: "bg-gray-100 text-gray-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  DONE: { label: "Done", color: "bg-green-100 text-green-700" },
};

export const STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const STORAGE_KEY = "orka-tasks";

export const HIERARCHY_RULES = {
  maxNestingDepth: 1,
  topLevelParentId: null,
} as const;
