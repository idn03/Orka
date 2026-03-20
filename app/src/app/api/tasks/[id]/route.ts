import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/session";
import { UpdateTaskInput } from "@/lib/task-types";
import { validateUpdateTask, ValidationErrors } from "@/lib/task-validation";
import { Prisma } from "@/generated/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated || !user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
        },
        parent: {
          select: { id: true, title: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { errors: { id: "Task not found" } },
        { status: 404 }
      );
    }

    const response = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
      parent_id: task.parentId,
      assignee_id: task.assigneeId,
      creator_id: task.creatorId,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      assignee: task.assignee,
      creator: task.creator,
      parent: task.parent,
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        status: subtask.status,
        due_date: subtask.dueDate ? subtask.dueDate.toISOString().split("T")[0] : null,
        assignee_id: subtask.assigneeId,
        assignee: subtask.assignee,
      })),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated || !user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body: UpdateTaskInput = await request.json();
    const errors: ValidationErrors = {};

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { _count: { select: { subtasks: true } } },
    });

    if (!existingTask) {
      return NextResponse.json(
        { errors: { id: "Task not found" } },
        { status: 404 }
      );
    }

    const isValid = await validateUpdateTask(id, body, errors);

    if (!isValid) {
      const hasNotFoundErrors = Object.keys(errors).some((key) =>
        errors[key].includes("not found")
      );

      if (hasNotFoundErrors) {
        return NextResponse.json({ errors }, { status: 404 });
      }

      const hasUnprocessableErrors = Object.keys(errors).some((key) =>
        errors[key].includes("Cannot") || errors[key].includes("nesting")
      );

      if (hasUnprocessableErrors) {
        return NextResponse.json({ errors }, { status: 422 });
      }

      return NextResponse.json({ errors }, { status: 400 });
    }

    const updateData: Prisma.TaskUpdateInput = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.due_date !== undefined) {
      updateData.dueDate = body.due_date ? new Date(body.due_date) : null;
    }
    if (body.assignee_id !== undefined) {
      updateData.assignee = body.assignee_id
        ? { connect: { id: body.assignee_id } }
        : { disconnect: true };
    }
    if (body.parent_id !== undefined) {
      updateData.parent = body.parent_id
        ? { connect: { id: body.parent_id } }
        : { disconnect: true };
    }

    const shouldCascadeToSubtasks =
      body.status === "DONE" &&
      existingTask.status !== "DONE";

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
        },
        parent: { select: { id: true, title: true } },
      },
    });

    if (shouldCascadeToSubtasks) {
      await prisma.task.updateMany({
        where: {
          parentId: id,
          status: { not: "DONE" },
        },
        data: { status: "DONE" },
      });
    }

    const response = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
      parent_id: task.parentId,
      assignee_id: task.assigneeId,
      creator_id: task.creatorId,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      assignee: task.assignee,
      creator: task.creator,
      parent: task.parent,
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        status: subtask.status,
        due_date: subtask.dueDate ? subtask.dueDate.toISOString().split("T")[0] : null,
        assignee_id: subtask.assigneeId,
        assignee: subtask.assignee,
      })),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated || !user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json(
        { errors: { id: "Task not found" } },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}
