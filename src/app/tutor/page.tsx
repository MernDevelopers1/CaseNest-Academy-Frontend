"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Video,
  BookOpen,
  MessageCircle,
  Calendar,
  Download,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  FileCheck,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";
import StatusBadge from "/src/components/ui/StatusBadge";
import StatCard from "/src/components/admin/dashboard/StatCard";
import CategoryChart from "/src/components/admin/dashboard/CategoryChart";
import CountriesMap from "/src/components/admin/dashboard/CountriesMap";
import DashboardError from "/src/components/admin/dashboard/DashboardError";
import type { TeacherDataResponse, CaseStudy } from "/src/lib/caseStudyTypes";
import { getDisplayStatus, formatDate } from "/src/lib/caseStudyTypes";

function errorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && typeof error.body === "string") return error.body;
  return undefined;
}

export default function TutorDashboardPage() {
  const { user } = useAuthContext();
  const name = getUserDisplayName(user);
  const { showToast } = useToast();

  const teacherDataQuery = useQuery({
    queryKey: ["teacher-dashboard-data", user?.id],
    queryFn: () => apiFetch<TeacherDataResponse>(`/teacherdata?Id=${user?.id}`),
    enabled: Boolean(user?.id),
  });

  const allCaseStudyQuery = useQuery({
    queryKey: ["all-case-study"],
    queryFn: () => apiFetch<CaseStudy[]>("/AllCaseStudy"),
    enabled: !user?.id, // fallback only if user id is missing
  });

  const hasError = teacherDataQuery.isError;

  useEffect(() => {
    if (!hasError) return;
    showToast({
      variant: "error",
      message: "Couldn't load tutor dashboard data. Check your connection and retry.",
    });
  }, [hasError, showToast]);

  const caseStudies: CaseStudy[] =
    teacherDataQuery.data?.CaseStudy ?? allCaseStudyQuery.data ?? [];

  const studentCount = teacherDataQuery.data?.Noofstudents ?? 0;
  const sessionCount = teacherDataQuery.data?.NoofSession ?? 0;
  const caseStudyCount = teacherDataQuery.data ? teacherDataQuery.data.CaseStudy?.length ?? 0 : caseStudies.length;
  const commentCount = teacherDataQuery.data?.NoOfComments ?? 0;

  const recentCaseStudies = caseStudies.slice(0, 5);

  function handleRetry() {
    teacherDataQuery.refetch();
    allCaseStudyQuery.refetch();
  }

  return (
    <div className="flex flex-col gap-lg">
      <Text size="small" className="text-on-surface-variant">
        Welcome{name ? `, ${name}` : ""}
      </Text>

      <div className="flex flex-col items-start justify-between gap-sm border-b border-outline-variant pb-md md:flex-row md:items-end">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Tutor Analytics
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            Overview of your active sessions, student engagement, and case study submissions.
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
          message={errorMessage(teacherDataQuery.error)}
          onRetry={handleRetry}
          retrying={teacherDataQuery.isFetching}
        />
      ) : (
        <>
          {/* Top Row: World Map & Stat Cards */}
          <div className="grid grid-cols-1 gap-xl lg:grid-cols-3">
            <Card padding="lg" className="flex flex-col lg:col-span-2">
              {teacherDataQuery.isLoading ? (
                <div className="h-[400px] w-full animate-pulse rounded-lg bg-surface-container" />
              ) : (
                <CountriesMap
                  rows={caseStudies}
                  onRefresh={() => teacherDataQuery.refetch()}
                />
              )}
            </Card>

            <div className="grid grid-cols-2 gap-md lg:col-span-1 lg:grid-cols-1">
              <StatCard
                label="Enrolled Students"
                icon={Users}
                loading={teacherDataQuery.isLoading}
                value={teacherDataQuery.data ? studentCount : null}
                trend={null}
              />
              <StatCard
                label="Active Sessions"
                icon={Video}
                loading={teacherDataQuery.isLoading}
                value={teacherDataQuery.data ? sessionCount : null}
                trend={null}
              />
              <StatCard
                label="Case Studies"
                icon={BookOpen}
                loading={teacherDataQuery.isLoading}
                value={teacherDataQuery.data ? caseStudyCount : null}
                trend={null}
              />
              <StatCard
                label="Comments"
                icon={MessageCircle}
                loading={teacherDataQuery.isLoading}
                value={teacherDataQuery.data ? commentCount : null}
                trend={null}
              />
            </div>
          </div>

          {/* Middle Row: Sectors Chart & Quick Actions */}
          <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
            <Card padding="lg" className="flex min-h-[380px] flex-col">
              <div className="mb-lg flex items-center justify-between">
                <Heading as="h3" size="h4" className="text-on-surface">
                  Sectors Share
                </Heading>
                <button
                  type="button"
                  aria-label="Sector options"
                  onClick={() =>
                    showToast({ variant: "info", message: "Chart settings coming soon" })
                  }
                  className="rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-variant"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="flex-1">
                {teacherDataQuery.isLoading ? (
                  <div className="h-full w-full min-h-[260px] animate-pulse rounded bg-surface-container" />
                ) : (
                  <CategoryChart
                    rows={caseStudies}
                    field="Sector"
                    variant="doughnut"
                  />
                )}
              </div>
            </Card>

            <Card padding="lg" className="flex min-h-[380px] flex-col justify-between">
              <div>
                <div className="mb-lg flex items-center justify-between">
                  <Heading as="h3" size="h4" className="text-on-surface">
                    Tutor Quick Links
                  </Heading>
                </div>
                <Text size="small" className="text-on-surface-variant mb-md">
                  Manage student submissions and monitor academic discussions across your assigned courses.
                </Text>
                <div className="flex flex-col gap-md">
                  <Link
                    href="/tutor/case-studies"
                    className="flex items-center justify-between rounded-lg border border-outline-variant p-md transition-all hover:border-primary hover:bg-surface-container-low"
                  >
                    <div className="flex items-center gap-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-small">Review Submissions</p>
                        <p className="text-caption text-on-surface-variant">
                          Approve or reject student case studies
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-on-surface-variant" />
                  </Link>

                  <Link
                    href="/tutor/discussions"
                    className="flex items-center justify-between rounded-lg border border-outline-variant p-md transition-all hover:border-primary hover:bg-surface-container-low"
                  >
                    <div className="flex items-center gap-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-small">Discussion Threads</p>
                        <p className="text-caption text-on-surface-variant">
                          Participate in and moderate student case study discussions
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-on-surface-variant" />
                  </Link>
                </div>
              </div>

              <div className="mt-lg rounded-lg bg-surface-container-low p-md border border-outline-variant">
                <p className="text-caption text-on-surface-variant">
                  Need to update your courses or syllabus materials? Contact the administrator to assign new sessions.
                </p>
              </div>
            </Card>
          </div>

          {/* Bottom Row: Recent Submissions Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant p-lg">
              <div>
                <Heading as="h3" size="h4" className="text-on-surface">
                  Recent Case Study Submissions
                </Heading>
                <Text size="caption" className="text-on-surface-variant">
                  Latest work submitted by students in your courses
                </Text>
              </div>
              <Link href="/tutor/case-studies">
                <Button variant="secondary" size="sm">
                  View All Submissions
                </Button>
              </Link>
            </div>

            {teacherDataQuery.isLoading ? (
              <div className="p-xl text-center text-on-surface-variant">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary mb-sm" />
                Loading submissions...
              </div>
            ) : recentCaseStudies.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant">
                <BookOpen size={40} className="mx-auto mb-sm opacity-40" />
                <p className="font-semibold">No case studies submitted yet</p>
                <p className="text-caption mt-xs">
                  Submissions from enrolled students in your sessions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small">
                  <thead className="bg-surface-container-low text-caption text-on-surface-variant uppercase">
                    <tr>
                      <th className="px-lg py-md">Title</th>
                      <th className="px-lg py-md">Author</th>
                      <th className="px-lg py-md">Session</th>
                      <th className="px-lg py-md">Sector</th>
                      <th className="px-lg py-md">Submitted</th>
                      <th className="px-lg py-md">Status</th>
                      <th className="px-lg py-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {recentCaseStudies.map((study) => {
                      const status = getDisplayStatus(study.Status);
                      const authorName = [study.FirstName, study.LastName].filter(Boolean).join(" ") || "Student";
                      return (
                        <tr key={study.CaseStudyId} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-lg py-md font-medium text-on-surface max-w-[240px] truncate">
                            {study.Title}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant">
                            {authorName}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant">
                            {study.SessionName || `Session #${study.SessionId}`}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant">
                            {study.Sector || "—"}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant text-caption">
                            {formatDate(study.SubmittedOn)}
                          </td>
                          <td className="px-lg py-md">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-lg py-md text-right">
                            <div className="flex items-center justify-end gap-xs">
                              <Link href={`/tutor/discussions/${study.CaseStudyId}`}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="gap-xs border-transparent hover:bg-surface-container"
                                >
                                  <MessageSquare size={14} />
                                  Discuss
                                </Button>
                              </Link>
                              <Link href="/tutor/case-studies">
                                <Button variant="secondary" size="sm">
                                  Review
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
