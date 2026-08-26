import { twMerge } from "/src/components/ui/Button";

export type StatusBadgeSize = "sm" | "md";

const STATUS_CLASSES: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border border-warning/30",
  Approved: "bg-success/15 text-success border border-success/30",
  Rejected: "bg-error/15 text-error border border-error/30",
};

const FALLBACK_CLASSES = "bg-surface-container text-on-surface-variant";

const SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  sm: "px-sm py-0.5 text-caption",
  md: "px-md py-xs text-small",
};

export interface StatusBadgeProps {
  status: "Pending" | "Approved" | "Rejected" | string;
  size?: StatusBadgeSize;
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full font-semibold capitalize",
        STATUS_CLASSES[status] ?? FALLBACK_CLASSES,
        SIZE_CLASSES[size],
        className,
      )}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
