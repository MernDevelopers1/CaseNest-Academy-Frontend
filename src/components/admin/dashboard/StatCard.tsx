import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "/src/components/ui/Card";
import Text from "/src/components/ui/Text";
import type { TrendBadge } from "/src/lib/dashboardTypes";

export interface StatCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  trend: TrendBadge | null;
  loading: boolean;
}

export default function StatCard({ label, value, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <Card padding="lg" className="flex h-full min-h-[140px] flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon size={20} />
        </div>
        {loading ? (
          <div className="h-6 w-12 animate-pulse rounded bg-surface-container" />
        ) : (
          trend && (
            <span
              className={
                "inline-flex items-center gap-xs rounded px-2 py-1 text-caption " +
                (trend.isUp
                  ? "bg-success/15 text-success"
                  : "bg-error-container text-on-error-container")
              }
            >
              {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.label}
            </span>
          )
        )}
      </div>
      <div className="mt-lg">
        <Text size="caption" className="uppercase tracking-wider text-on-surface-variant">
          {label}
        </Text>
        {loading ? (
          <div className="mt-2 h-9 w-16 animate-pulse rounded bg-surface-container" />
        ) : (
          <p className="mt-1 text-display text-primary">{value ?? "—"}</p>
        )}
      </div>
    </Card>
  );
}
