"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Video,
  BookOpen,
  MessageCircle,
  Calendar,
  Download,
  MoreVertical,
  ListFilter,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import StatCard from "/src/components/admin/dashboard/StatCard";
import CategoryChart from "/src/components/admin/dashboard/CategoryChart";
import CountriesMap from "/src/components/admin/dashboard/CountriesMap";
import DashboardError from "/src/components/admin/dashboard/DashboardError";
import { trendBadge } from "/src/lib/dashboardTypes";
import type { DashboardTrends, CaseStudyRow } from "/src/lib/dashboardTypes";

const STATS: { key: keyof DashboardTrends; label: string; icon: LucideIcon }[] = [
  { key: "Students", label: "Enrolled Students", icon: Users },
  { key: "Sessions", label: "Sessions", icon: Video },
  { key: "CaseStudy", label: "Case Studies", icon: BookOpen },
  { key: "TotalComments", label: "All Comments", icon: MessageCircle },
];

function errorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && typeof error.body === "string") return error.body;
  return undefined;
}

export default function AdminDashboardPage() {
  const { user } = useAuthContext();
  const name = getUserDisplayName(user);
  const { showToast } = useToast();

  const trendsQuery = useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: () => apiFetch<DashboardTrends>("/DashboardTrends"),
  });

  const caseStudyQuery = useQuery({
    queryKey: ["all-case-study"],
    queryFn: () => apiFetch<CaseStudyRow[]>("/AllCaseStudy"),
  });

  const hasError = trendsQuery.isError || caseStudyQuery.isError;

  useEffect(() => {
    if (!hasError) return;
    showToast({
      variant: "error",
      message: "Couldn't load dashboard data. Check your connection and retry.",
    });
  }, [hasError, showToast]);

  function handleRetry() {
    trendsQuery.refetch();
    caseStudyQuery.refetch();
  }

  return (
    <div className="flex flex-col gap-lg">
      <Text size="small" className="text-on-surface-variant">
        Welcome{name ? `, ${name}` : ""}
      </Text>

      <div className="flex flex-col items-start justify-between gap-sm border-b border-outline-variant pb-md md:flex-row md:items-end">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Global Analytics
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            Overview of collaborative learning distribution and engagement.
          </Text>
        </div>
        <div className="flex gap-sm">
          <button
            type="button"
            onClick={() =>
              showToast({ variant: "info", message: "Date-range filtering isn't available yet" })
            }
            className="flex items-center gap-xs rounded-lg border border-outline px-lg py-sm text-small text-on-surface transition-colors hover:bg-surface-container"
          >
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => showToast({ variant: "info", message: "Export isn't available yet" })}
            className="flex items-center gap-xs rounded-lg bg-secondary px-lg py-sm text-small text-on-secondary transition-opacity hover:opacity-90"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {hasError ? (
        <DashboardError
          message={errorMessage(trendsQuery.error) ?? errorMessage(caseStudyQuery.error)}
          onRetry={handleRetry}
          retrying={trendsQuery.isFetching || caseStudyQuery.isFetching}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-xl lg:grid-cols-3">
            <Card padding="lg" className="flex flex-col lg:col-span-2">
              {caseStudyQuery.isLoading ? (
                <div className="h-[400px] w-full animate-pulse rounded-lg bg-surface-container" />
              ) : (
                <CountriesMap
                  rows={caseStudyQuery.data ?? []}
                  onRefresh={() => caseStudyQuery.refetch()}
                />
              )}
            </Card>

            <div className="grid grid-cols-2 gap-md lg:col-span-1 lg:grid-cols-1">
              {STATS.map(({ key, label, icon }) => (
                <StatCard
                  key={key}
                  label={label}
                  icon={icon}
                  loading={trendsQuery.isLoading}
                  value={trendsQuery.data ? trendsQuery.data[key].current : null}
                  trend={trendsQuery.data ? trendBadge(trendsQuery.data[key]) : null}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
            <Card padding="lg" className="flex min-h-[380px] flex-col">
              <div className="mb-lg flex items-center justify-between">
                <Heading as="h3" size="h4" className="text-on-surface">
                  Sectors Share
                </Heading>
                <button
                  type="button"
                  aria-label="More options"
                  onClick={() =>
                    showToast({ variant: "info", message: "No additional options yet" })
                  }
                  className="rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
              {caseStudyQuery.isLoading ? (
                <div className="h-full min-h-[260px] w-full animate-pulse rounded-lg bg-surface-container" />
              ) : (
                <CategoryChart rows={caseStudyQuery.data ?? []} field="Sector" variant="pie" />
              )}
            </Card>

            <Card padding="lg" className="flex min-h-[380px] flex-col">
              <div className="mb-lg flex items-center justify-between">
                <Heading as="h3" size="h4" className="text-on-surface">
                  Models / Frameworks
                </Heading>
                <button
                  type="button"
                  aria-label="Filter"
                  onClick={() => showToast({ variant: "info", message: "Filtering isn't available yet" })}
                  className="rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <ListFilter size={18} />
                </button>
              </div>
              {caseStudyQuery.isLoading ? (
                <div className="h-full min-h-[260px] w-full animate-pulse rounded-lg bg-surface-container" />
              ) : (
                <CategoryChart
                  rows={caseStudyQuery.data ?? []}
                  field="ModelAndFramworkCoverd"
                  variant="doughnut"
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
