import { validateCreateTask, validateUpdateTask } from "@/lib/task-validation";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe("Task Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCreateTask", () => {
    it("should pass validation with valid input", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const errors: Record<string, string> = {};
      const result = await validateCreateTask(
        { title: "Test Task", description: "Description", due_date: "2026-04-01" },
        errors
      );

      expect(result).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("should fail when title is missing", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCreateTask({}, errors);

      expect(result).toBe(false);
      expect(errors.title).toBe("Title is required");
    });

    it("should fail when title is whitespace only", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCreateTask({ title: "   " }, errors);

      expect(result).toBe(false);
      expect(errors.title).toBe("Title is required");
    });

    it("should fail when title exceeds 255 characters", async () => {
      const errors: Record<string, string> = {};
      const longTitle = "a".repeat(256);
      const result = await validateCreateTask({ title: longTitle }, errors);

      expect(result).toBe(false);
      expect(errors.title).toBe("Title must not exceed 255 characters");
    });

    it("should fail when due_date format is invalid", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCreateTask({ title: "Test", due_date: "invalid-date" }, errors);

      expect(result).toBe(false);
      expect(errors.due_date).toBe("Invalid date format. Use YYYY-MM-DD");
    });

    it("should fail when assignee_id references non-existent user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const errors: Record<string, string> = {};
      const result = await validateCreateTask({ title: "Test", assignee_id: "non-existent" }, errors);

      expect(result).toBe(false);
      expect(errors.assignee_id).toBe("User not found");
    });

    it("should fail when parent_id references a subtask (not top-level)", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: "task-1", parentId: "task-parent" });

      const errors: Record<string, string> = {};
      const result = await validateCreateTask({ title: "Test", parent_id: "task-1" }, errors);

      expect(result).toBe(false);
      expect(errors.parent_id).toBe("Cannot nest subtask under another subtask");
    });
  });

  describe("validateUpdateTask", () => {
    it("should fail when setting parent_id to self", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: "task-1", parentId: null });
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const errors: Record<string, string> = {};
      const result = await validateUpdateTask("task-1", { parent_id: "task-1" }, errors);

      expect(result).toBe(false);
      expect(errors.parent_id).toBe("Cannot set parent_id to self");
    });

    it("should fail when making a task with subtasks into a subtask", async () => {
      (prisma.task.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: "task-1", parentId: null })
        .mockResolvedValueOnce({ id: "parent-task", parentId: null });
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: "subtask-1" }]);

      const errors: Record<string, string> = {};
      const result = await validateUpdateTask("task-1", { parent_id: "parent-task" }, errors);

      expect(result).toBe(false);
      expect(errors.parent_id).toBe("Cannot make a task with subtasks into a subtask");
    });
  });
});
