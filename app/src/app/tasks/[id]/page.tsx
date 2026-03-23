import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TaskDetailClient } from "@/components/task-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  return <TaskDetailClient taskId={id} currentUserId={session.user.id!} />
}
