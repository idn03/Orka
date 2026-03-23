import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskForm } from "@/components/task-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

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
  })

  if (!task) {
    notFound()
  }

  const taskResponse = {
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
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      status: subtask.status,
      due_date: subtask.dueDate ? subtask.dueDate.toISOString().split("T")[0] : null,
      assignee_id: subtask.assigneeId,
      assignee: subtask.assignee,
    })),
    parent: task.parent,
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <TaskForm task={taskResponse} isEdit taskId={id} />
    </div>
  )
}
