"use client";

import type { ReactNode } from "react";
import { twMerge } from "/src/components/ui/Button";
import Card from "/src/components/ui/Card";

export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

const SKELETON_ROWS = 5;

function cellValue<T>(row: T, column: TableColumn<T>): ReactNode {
  if (column.render) return column.render(row);
  const value = row[column.key];
  return value == null ? null : String(value);
}

export function Table<T>({
  columns,
  rows,
  loading = false,
  emptyMessage = "No data to display.",
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div className={className}>
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-caption uppercase tracking-wider">
            {columns.map((column) => (
              <th key={column.key} className="p-lg font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="border-b border-outline-variant">
                {columns.map((column) => (
                  <td key={column.key} className="p-lg">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="p-2xl text-center text-on-surface-variant"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={twMerge(
                  "group border-b border-outline-variant",
                  i % 2 === 0 ? "bg-surface" : "bg-surface-container-low",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="p-lg">
                    {cellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-md md:hidden">
        {loading &&
          Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-sm">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="h-4 w-full animate-pulse rounded bg-surface-container"
                />
              ))}
            </Card>
          ))}
        {!loading && rows.length === 0 && (
          <p className="p-2xl text-center text-on-surface-variant">
            {emptyMessage}
          </p>
        )}
        {!loading &&
          rows.map((row, i) => (
            <Card
              key={i}
              interactive={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className="flex flex-col gap-sm"
            >
              {columns.map((column) => (
                <div key={column.key} className="flex flex-col gap-xs">
                  <span className="text-caption text-on-surface-variant">
                    {column.label}
                  </span>
                  <span className="text-body text-on-surface">
                    {cellValue(row, column)}
                  </span>
                </div>
              ))}
            </Card>
          ))}
      </div>
    </div>
  );
}

export default Table;
