import { KanbanBoard } from "@/components/kanban-board";
import { TEAM_MEMBERS, SEED_TASKS } from "@/lib/seed-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {TEAM_MEMBERS.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {TEAM_MEMBERS.length} members
            </span>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-hidden">
        <KanbanBoard tasks={SEED_TASKS} members={TEAM_MEMBERS} />
      </main>
    </div>
  );
}
