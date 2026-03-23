"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllTasks, getAllAssignees } from "@/lib/store";

export default function Home() {
  const tasks = getAllTasks();
  const assignees = getAllAssignees();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Orka Tasks</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {assignees.length} team members
              </span>
            </div>
            <Link href="/tasks">
              <Button>View Tasks</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Welcome to Orka Tasks</h2>
            <p className="text-muted-foreground mt-2">
              You have {tasks.length} tasks total
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/tasks?status=TODO" className="block">
              <div className="rounded-lg border p-4 hover:bg-accent">
                <h3 className="font-medium">To Do</h3>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "TODO").length}
                </p>
              </div>
            </Link>
            <Link href="/tasks?status=IN_PROGRESS" className="block">
              <div className="rounded-lg border p-4 hover:bg-accent">
                <h3 className="font-medium">In Progress</h3>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "IN_PROGRESS").length}
                </p>
              </div>
            </Link>
            <Link href="/tasks?status=IN_REVIEW" className="block">
              <div className="rounded-lg border p-4 hover:bg-accent">
                <h3 className="font-medium">In Review</h3>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "IN_REVIEW").length}
                </p>
              </div>
            </Link>
            <Link href="/tasks?status=DONE" className="block">
              <div className="rounded-lg border p-4 hover:bg-accent">
                <h3 className="font-medium">Done</h3>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "DONE").length}
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/tasks/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Task
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
