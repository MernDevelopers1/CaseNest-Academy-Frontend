"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Users, Video, BookOpen, MessageCircle } from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
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
      <Heading as="h1" size="h2" className="text-on-surface">
        Welcome{name ? `, ${name}` : ""}
      </Heading>

      {hasError ? (
        <DashboardError
          message={errorMessage(trendsQuery.error) ?? errorMessage(caseStudyQuery.error)}
          onRetry={handleRetry}
          retrying={trendsQuery.isFetching || caseStudyQuery.isFetching}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
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

          <Card padding="lg" className="flex flex-col">
            <Heading as="h3" size="h4" className="mb-md text-on-surface">
              Countries Represented
            </Heading>
            {caseStudyQuery.isLoading ? (
              <div className="h-[400px] w-full animate-pulse rounded-lg bg-surface-container" />
            ) : (
              <CountriesMap rows={caseStudyQuery.data ?? []} />
            )}
          </Card>

          <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
            <Card padding="lg" className="flex min-h-[380px] flex-col">
              <Heading as="h3" size="h4" className="mb-md text-on-surface">
                Frameworks &amp; Models
              </Heading>
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

            <Card padding="lg" className="flex min-h-[380px] flex-col">
              <Heading as="h3" size="h4" className="mb-md text-on-surface">
                Sectors
              </Heading>
              {caseStudyQuery.isLoading ? (
                <div className="h-full min-h-[260px] w-full animate-pulse rounded-lg bg-surface-container" />
              ) : (
                <CategoryChart rows={caseStudyQuery.data ?? []} field="Sector" variant="pie" />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
