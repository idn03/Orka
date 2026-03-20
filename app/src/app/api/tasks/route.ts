import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/session";
import { transformTask, TaskWithRelations, CreateTaskInput } from "@/lib/task-types";
import { validateCreateTask, ValidationErrors } from "@/lib/task-validation";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated || !user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assignee_id");
    const due = searchParams.get("due");
    const parentId = searchParams.get("parent_id");

    const where: Prisma.TaskWhereInput = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (status) {
      where.status = status as Prisma.EnumTaskStatusFilter["equals"];
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (due) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (due) {
        case "overdue":
          where.dueDate = { lt: today };
          where.status = { not: "DONE" };
          break;
        case "today":
          where.dueDate = {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          };
          break;
        case "this_week":
          const endOfWeek = new Date(today);
          const dayOfWeek = today.getDay();
          const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
          endOfWeek.setDate(today.getDate() + daysUntilSunday);
          endOfWeek.setHours(23, 59, 59, 999);
          where.dueDate = { gte: today, lte: endOfWeek };
          break;
        case "none":
          where.dueDate = null;
          break;
      }
    }

    if (parentId !== null) {
      if (parentId === "null") {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { subtasks: true } },
      },
    });

    return NextResponse.json(tasks.map((task) => transformTask(task as TaskWithRelations)));
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated || !user) {
    return unauthorizedResponse();
  }

  try {
    const body: CreateTaskInput = await request.json();
    const errors: ValidationErrors = {};

    const isValid = await validateCreateTask(body, errors);

    if (!isValid) {
      const hasNotFoundErrors = Object.keys(errors).some((key) =>
        errors[key].includes("not found")
      );

      if (hasNotFoundErrors) {
        return NextResponse.json({ errors }, { status: 404 });
      }

      return NextResponse.json({ errors }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title!.trim(),
        description: body.description || null,
        dueDate: body.due_date ? new Date(body.due_date) : null,
        assigneeId: body.assignee_id || null,
        parentId: body.parent_id || null,
        creatorId: user.id,
        status: "TODO",
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { subtasks: true } },
      },
    });

    return NextResponse.json(transformTask(task as TaskWithRelations), { status: 201 });
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}
