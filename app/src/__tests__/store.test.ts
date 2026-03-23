import { STORAGE_KEY } from "@/lib/types";
import { mockStorage } from "./store-setup";
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  queryTasks,
  getSubtasks,
  getAllAssignees,
} from "@/lib/store";
import type { Task } from "@/lib/types";
import { SEED_TASKS } from "@/lib/seed-data";

function setStorageData(tasks: Task[]): void {
  mockStorage[STORAGE_KEY] = JSON.stringify(tasks);
}

function clearStorage(): void {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
}

function setupSeedData(): void {
  setStorageData([...SEED_TASKS]);
}

describe("Task Interface", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Task has all required fields", () => {
    const task = getAllTasks()[0];
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("description");
    expect(task).toHaveProperty("dueDate");
    expect(task).toHaveProperty("parentId");
    expect(task).toHaveProperty("assignee");
    expect(task).toHaveProperty("createdAt");
    expect(task).toHaveProperty("updatedAt");
  });

  it("Default status is TODO for new tasks", () => {
    const task = createTask({ title: "Test Task" });
    expect(task.status).toBe("TODO");
  });

  it("Default optional fields are null for new tasks", () => {
    const task = createTask({ title: "Test Task" });
    expect(task.description).toBeNull();
    expect(task.dueDate).toBeNull();
    expect(task.parentId).toBeNull();
    expect(task.assignee).toBeNull();
  });
});

describe("getAllTasks / getTask", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("getAllTasks returns all tasks from storage", () => {
    const tasks = getAllTasks();
    expect(tasks.length).toBe(SEED_TASKS.length);
  });

  it("getTask with valid id returns task object", () => {
    const task = getTask(SEED_TASKS[0].id);
    expect(task).toBeDefined();
    expect(task?.title).toBe(SEED_TASKS[0].title);
  });

  it("getTask with invalid id returns undefined", () => {
    const task = getTask("non-existent-id");
    expect(task).toBeUndefined();
  });
});

describe("createTask", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Creates task with title", () => {
    const initialCount = getAllTasks().length;
    const task = createTask({ title: "New Task" });
    expect(task.title).toBe("New Task");
    expect(getAllTasks().length).toBe(initialCount + 1);
  });

  it("Creates task with description", () => {
    const task = createTask({ title: "Task", description: "Description" });
    expect(task.description).toBe("Description");
  });

  it("Creates task with dueDate", () => {
    const task = createTask({ title: "Task", dueDate: "2026-04-01" });
    expect(task.dueDate).toBe("2026-04-01");
  });

  it("Creates task with assignee", () => {
    const task = createTask({ title: "Task", assignee: "Alice" });
    expect(task.assignee).toBe("Alice");
  });

  it("Creates task with parentId", () => {
    const parent = SEED_TASKS.find(t => t.parentId === null)!;
    const child = createTask({ title: "Child", parentId: parent.id });
    expect(child.parentId).toBe(parent.id);
  });

  it("Throws error for empty title", () => {
    expect(() => createTask({ title: "" })).toThrow("Title is required");
  });

  it("Throws error for whitespace-only title", () => {
    expect(() => createTask({ title: "   " })).toThrow("Title is required");
  });

  it("Throws error for title > 255 chars", () => {
    const longTitle = "a".repeat(256);
    expect(() => createTask({ title: longTitle })).toThrow("Title must be 255 characters or less");
  });

  it("Accepts valid due date format", () => {
    const task = createTask({ title: "Task", dueDate: "2026-04-01" });
    expect(task.dueDate).toBe("2026-04-01");
  });

  it("Throws error for subtask under subtask", () => {
    const subtask = SEED_TASKS.find(t => t.parentId !== null)!;
    expect(() =>
      createTask({ title: "Grandchild", parentId: subtask.id })
    ).toThrow("Cannot nest subtasks under subtasks (max 1 level)");
  });
});

describe("updateTask", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Update title", () => {
    const task = SEED_TASKS[0];
    updateTask(task.id, { title: "Updated" });
    expect(getTask(task.id)?.title).toBe("Updated");
  });

  it("Update description", () => {
    const task = SEED_TASKS[0];
    updateTask(task.id, { description: "New description" });
    expect(getTask(task.id)?.description).toBe("New description");
  });

  it("Update status", () => {
    const task = SEED_TASKS[0];
    updateTask(task.id, { status: "IN_PROGRESS" });
    expect(getTask(task.id)?.status).toBe("IN_PROGRESS");
  });

  it("Update dueDate", () => {
    const task = SEED_TASKS[0];
    updateTask(task.id, { dueDate: "2026-04-01" });
    expect(getTask(task.id)?.dueDate).toBe("2026-04-01");
  });

  it("Update assignee", () => {
    const task = SEED_TASKS[0];
    updateTask(task.id, { assignee: "Bob" });
    expect(getTask(task.id)?.assignee).toBe("Bob");
  });

  it("Update status to DONE cascades to subtasks", () => {
    const parent = SEED_TASKS.find(t => t.title === "Implement authentication API")!;
    const subtasks = getSubtasks(parent.id);
    const nonDoneSubtasks = subtasks.filter(s => s.status !== "DONE");
    if (nonDoneSubtasks.length > 0) {
      const subtask = nonDoneSubtasks[0];
      updateTask(parent.id, { status: "DONE" });
      expect(getTask(subtask.id)?.status).toBe("DONE");
    }
  });

  it("Throws error when updating non-existent task", () => {
    expect(() => updateTask("non-existent", { title: "New" })).toThrow("Task not found");
  });

  it("Throws error for circular parent reference", () => {
    const parent = SEED_TASKS.find(t => t.title === "Implement authentication API")!;
    const subtask = getSubtasks(parent.id)[0];
    if (subtask) {
      expect(() => updateTask(parent.id, { parentId: subtask.id })).toThrow(
        "Cannot nest subtasks under subtasks (max 1 level)"
      );
    }
  });
});

describe("deleteTask", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Delete task removes it from storage", () => {
    const task = SEED_TASKS[0];
    const initialCount = getAllTasks().length;
    deleteTask(task.id);
    expect(getTask(task.id)).toBeUndefined();
    expect(getAllTasks().length).toBe(initialCount - 1);
  });

  it("Delete non-existent task silently succeeds", () => {
    expect(() => deleteTask("non-existent")).not.toThrow();
  });
});

describe("queryTasks", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Filter by search - ILIKE substring match", () => {
    const results = queryTasks({ search: "login" });
    expect(results.some((t) => t.title.toLowerCase().includes("login"))).toBe(true);
  });

  it("Filter by status - Only matching status", () => {
    const todoTasks = queryTasks({ status: "TODO" });
    expect(todoTasks.every((t) => t.status === "TODO")).toBe(true);
  });

  it("Filter by assignee - Only matching assignee", () => {
    const aliceTasks = queryTasks({ assignee: "Alice" });
    expect(aliceTasks.every((t) => t.assignee === "Alice")).toBe(true);
  });

  it("Combine filters - AND logic applied", () => {
    const results = queryTasks({ status: "TODO", assignee: "Alice" });
    expect(results.every((t) => t.status === "TODO" && t.assignee === "Alice")).toBe(true);
  });
});

describe("getSubtasks", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Returns subtasks for parent", () => {
    const parent = SEED_TASKS.find(t => t.title === "Implement authentication API");
    if (parent) {
      const subtasks = getSubtasks(parent.id);
      expect(subtasks.every((t) => t.parentId === parent.id)).toBe(true);
    }
  });

  it("Returns empty array for task with no subtasks", () => {
    const task = SEED_TASKS.find(t => t.parentId !== null);
    if (task) {
      const subtasks = getSubtasks(task.id);
      expect(subtasks).toEqual([]);
    }
  });
});

describe("getAllAssignees", () => {
  beforeEach(() => {
    clearStorage();
    setupSeedData();
  });

  it("Returns unique sorted assignee names", () => {
    const assignees = getAllAssignees();
    const expected = [...new Set(SEED_TASKS.map(t => t.assignee).filter(Boolean) as string[])].sort();
    expect(assignees).toEqual(expected);
  });
});
