"use client";

import "/src/lib/chartjsSetup";
import { useMemo } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import { useChartColors } from "/src/lib/chartTokens";
import { groupCount } from "/src/lib/groupCount";
import EmptyChartState from "/src/components/admin/dashboard/EmptyChartState";

export interface CategoryChartProps<T> {
  rows: T[];
  field: keyof T;
  variant: "doughnut" | "pie";
}

export default function CategoryChart<T>({ rows, field, variant }: CategoryChartProps<T>) {
  const colors = useChartColors();
  const grouped = useMemo(() => groupCount(rows, field), [rows, field]);

  if (grouped.length === 0) return <EmptyChartState />;

  const data = {
    labels: grouped.map((entry) => entry.label),
    datasets: [
      {
        data: grouped.map((entry) => entry.count),
        backgroundColor: grouped.map(
          (_, i) => colors.categorical[i % colors.categorical.length],
        ),
        borderColor: colors.border,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: colors.text, boxWidth: 12, padding: 12 },
      },
    },
  };

  const ChartComponent = variant === "doughnut" ? Doughnut : Pie;
  return (
    <div className="h-full min-h-[260px] w-full">
      <ChartComponent data={data} options={options} />
    </div>
  );
}
