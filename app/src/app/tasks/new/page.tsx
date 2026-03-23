import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TaskForm } from "@/components/task-form"

interface PageProps {
  searchParams: Promise<{ parent_id?: string }>
}

export default async function NewTaskPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const params = await searchParams
  const parentId = params.parent_id || null

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <TaskForm parentId={parentId} />
    </div>
  )
}
