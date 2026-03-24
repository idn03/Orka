import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title?: string;
  backLink?: string;
  onBackClick?: () => void;
  action?: React.ReactNode;
}

export function PageHeader({
  title = "Orka Tasks",
  backLink,
  onBackClick,
  action,
}: PageHeaderProps) {
  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backLink && (
            <Link href={backLink}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {onBackClick && (
            <Button variant="ghost" size="icon" onClick={onBackClick}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}
