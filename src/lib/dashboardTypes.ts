// Shapes match the real Backend responses (Backend/src/controllers/
// dashboard.controller.js and caseStudy.controller.js) — only the fields
// the dashboard actually renders are typed here, not every column.

export interface TrendStat {
  current: number;
  past: number;
}

export interface DashboardTrends {
  Students: TrendStat;
  Sessions: TrendStat;
  CaseStudy: TrendStat;
  TotalComments: TrendStat;
}

export interface CaseStudyRow {
  ModelAndFramworkCoverd?: string | null;
  Sector?: string | null;
  CountryValue?: string | null;
}

export interface TrendBadge {
  isUp: boolean;
  label: string;
}

export function trendBadge(trend?: TrendStat): TrendBadge | null {
  if (!trend || !trend.past) return null;
  const percent = Math.round(((trend.current - trend.past) / trend.past) * 100);
  if (percent === 0) return null;
  return { isUp: percent > 0, label: `${Math.abs(percent)}%` };
}
