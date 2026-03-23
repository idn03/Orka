import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { auth } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TaskList } from "@/components/task-list"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const currentUser = {
    id: session.user.id!,
    name: session.user.name!,
    email: session.user.email!,
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{currentUser.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Link href="/tasks/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </Link>
          </div>

          <TaskList
            currentUserId={currentUser.id}
            initialUsers={users}
          />
        </div>
      </main>
    </div>
  )
}
