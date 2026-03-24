import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";

interface TaskNotFoundProps {
  backLink?: string;
  onBackClick?: () => void;
  message?: string;
  showBackButton?: boolean;
}

export function TaskNotFound({
  backLink = "/tasks",
  onBackClick,
  message = "The requested task could not be found.",
  showBackButton = true,
}: TaskNotFoundProps) {
  return (
    <PageShell>
      <PageHeader title="Task Not Found" backLink={backLink} onBackClick={onBackClick} />
      <main className="flex-1 p-6">
        <p className="text-muted-foreground">{message}</p>
        {showBackButton && (
          <div className="mt-4">
            <Button onClick={onBackClick || (() => window.history.back())}>
              Back to Tasks
            </Button>
          </div>
        )}
      </main>
    </PageShell>
  );
}
