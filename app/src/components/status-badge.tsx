import { TaskStatus, STATUS_CONFIG } from "@/lib/types";

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const bgColors: Record<TaskStatus, string> = {
    TODO: "#e5e7eb",
    IN_PROGRESS: "#dbeafe",
    IN_REVIEW: "#fef3c7",
    DONE: "#dcfce7",
  };
  const textColors: Record<TaskStatus, string> = {
    TODO: "#374151",
    IN_PROGRESS: "#1d4ed8",
    IN_REVIEW: "#92400e",
    DONE: "#166534",
  };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: bgColors[status],
        color: textColors[status],
      }}
    >
      {config.label}
    </span>
  );
}
