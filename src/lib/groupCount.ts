export interface GroupCountEntry {
  label: string;
  count: number;
}

export function groupCount<T>(rows: T[], key: keyof T): GroupCountEntry[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key];
    if (typeof raw !== "string" || !raw) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count,
  );
}
