"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  CheckCircle2,
  Clock,
  Upload,
  MessageSquare,
  Star,
  Download,
  BookOpen,
  Eye,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import {
  getUserDisplayName,
  getUserId,
  getUserSessionId,
  getUserSessionName,
} from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import { apiFetch } from "/src/lib/api";
import type { CaseStudy } from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatDate,
} from "/src/lib/caseStudyTypes";
import StudentCaseStudyPreviewModal from "/src/components/student/StudentCaseStudyPreviewModal";

interface SessionResource {
  ResourceId: number;
  SessionId: number;
  ResourceName: string;
  ResourceFile: string;
  ResourceType?: string;
  AddedOn?: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuthContext();
  const name = getUserDisplayName(user);
  const userId = getUserId(user);
  const sessionId = getUserSessionId(user);
  const sessionName = getUserSessionName(user);

  const [previewStudy, setPreviewStudy] = useState<CaseStudy | null>(null);

  // Fetch student's own case studies
  const myStudiesQuery = useQuery({
    queryKey: ["student-my-case-studies", userId],
    queryFn: () =>
      apiFetch<CaseStudy[]>(`/AddCaseStudy?UserId=${userId}`),
    enabled: Boolean(userId),
  });

  // Fetch approved classmate case studies in session
  const classmateStudiesQuery = useQuery({
    queryKey: ["student-classmate-studies", sessionId],
    queryFn: () =>
      apiFetch<CaseStudy[]>(
        sessionId
          ? `/GetAllCaseStudies?SessionId=${sessionId}&onlyApproved=true`
          : "/AllCaseStudy?onlyApproved=true"
      ),
  });

  // Fetch session resources
  const resourcesQuery = useQuery({
    queryKey: ["session-resources", sessionId],
    queryFn: () =>
      apiFetch<SessionResource[]>(`/Addresources?SessionId=${sessionId}`),
    enabled: Boolean(sessionId),
  });

  const myStudies = useMemo(
    () => myStudiesQuery.data ?? [],
    [myStudiesQuery.data]
  );
  const classmateStudies = useMemo(
    () => classmateStudiesQuery.data ?? [],
    [classmateStudiesQuery.data]
  );
  const resources = useMemo(
    () => resourcesQuery.data ?? [],
    [resourcesQuery.data]
  );

  // Status breakdown calculations
  const totalSubmissions = myStudies.length;
  const approvedCount = myStudies.filter(
    (s) => getDisplayStatus(s.Status) === "Approved"
  ).length;
  const pendingCount = myStudies.filter(
    (s) => getDisplayStatus(s.Status) === "Pending"
  ).length;
  const rejectedCount = myStudies.filter(
    (s) => getDisplayStatus(s.Status) === "Rejected"
  ).length;

  const approvedPct =
    totalSubmissions > 0
      ? Math.round((approvedCount / totalSubmissions) * 100)
      : 0;
  const pendingPct =
    totalSubmissions > 0
      ? Math.round((pendingCount / totalSubmissions) * 100)
      : 0;
  const rejectedPct =
    totalSubmissions > 0
      ? Math.round((rejectedCount / totalSubmissions) * 100)
      : 0;

  const recentStudies = useMemo(() => myStudies.slice(0, 4), [myStudies]);

  const isLoading = myStudiesQuery.isLoading;

  return (
    <div className="flex flex-col gap-xl max-w-7xl mx-auto pb-2xl">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-gradient-to-br from-surface to-surface-container p-xl shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="flex items-center gap-md">
            <Avatar
              name={name || "Student"}
              size="lg"
              className="border-2 border-primary/20 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-xs">
                <Heading as="h1" size="h2" className="text-on-surface">
                  Welcome, {name || "Student"}
                </Heading>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-semibold bg-primary/10 text-primary">
                  Student Portal
                </span>
              </div>
              <p className="mt-xs text-small text-on-surface-variant flex items-center gap-xs">
                <span>Enrolled Session:</span>
                <span className="font-semibold text-on-surface">
                  {sessionName || "Active Cohort"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-sm">
            <Link href="/student/submit">
              <Button variant="primary" className="gap-xs shadow-sm">
                <Upload size={16} />
                Submit Case Study
              </Button>
            </Link>
            <Link href="/student/discussion">
              <Button variant="secondary" className="gap-xs">
                <BookOpen size={16} />
                Browse Classmate Studies
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Card 1: Total Submissions */}
        <Card className="p-lg flex items-center gap-md border border-outline-variant bg-surface">
          <div className="p-md rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-caption font-medium uppercase text-on-surface-variant">
              My Submissions
            </p>
            <p className="text-h2 font-bold text-on-surface mt-0.5">
              {isLoading ? "—" : totalSubmissions}
            </p>
            <p className="text-caption text-on-surface-variant mt-0.5">
              Total papers uploaded
            </p>
          </div>
        </Card>

        {/* Card 2: Approved Studies */}
        <Card className="p-lg flex items-center gap-md border border-outline-variant bg-surface">
          <div className="p-md rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-caption font-medium uppercase text-on-surface-variant">
              Approved & Live
            </p>
            <p className="text-h2 font-bold text-on-surface mt-0.5">
              {isLoading ? "—" : approvedCount}
            </p>
            <p className="text-caption text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Visible to classmates
            </p>
          </div>
        </Card>

        {/* Card 3: Pending Review */}
        <Card className="p-lg flex items-center gap-md border border-outline-variant bg-surface">
          <div className="p-md rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-caption font-medium uppercase text-on-surface-variant">
              Pending Review
            </p>
            <p className="text-h2 font-bold text-on-surface mt-0.5">
              {isLoading ? "—" : pendingCount}
            </p>
            <p className="text-caption text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
              Awaiting tutor review
            </p>
          </div>
        </Card>

        {/* Card 4: Peer Studies */}
        <Card className="p-lg flex items-center gap-md border border-outline-variant bg-surface">
          <div className="p-md rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-caption font-medium uppercase text-on-surface-variant">
              Classmate Studies
            </p>
            <p className="text-h2 font-bold text-on-surface mt-0.5">
              {classmateStudiesQuery.isLoading ? "—" : classmateStudies.length}
            </p>
            <p className="text-caption text-purple-600 dark:text-purple-400 mt-0.5 font-medium">
              Available for discussion
            </p>
          </div>
        </Card>
      </div>

      {/* Submission Status Breakdown Card */}
      {totalSubmissions > 0 && (
        <Card className="p-lg border border-outline-variant bg-surface flex flex-col gap-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
            <div>
              <Heading as="h3" size="h4" className="text-on-surface">
                Submission Status Progress
              </Heading>
              <p className="text-caption text-on-surface-variant mt-0.5">
                Overview of your submitted case studies and their peer-review stages
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-md text-caption">
              <span className="flex items-center gap-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Approved ({approvedCount})
              </span>
              <span className="flex items-center gap-xs text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending ({pendingCount})
              </span>
              {rejectedCount > 0 && (
                <span className="flex items-center gap-xs text-rose-600 dark:text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Needs Revision ({rejectedCount})
                </span>
              )}
            </div>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-3 w-full rounded-full bg-surface-container overflow-hidden flex">
            <div
              style={{ width: `${approvedPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Approved: ${approvedCount}`}
            />
            <div
              style={{ width: `${pendingPct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Pending: ${pendingCount}`}
            />
            <div
              style={{ width: `${rejectedPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Needs Revision: ${rejectedCount}`}
            />
          </div>
        </Card>
      )}

      {/* Main Bento Layout: Recent Studies (2 cols) + Actions & Resources (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left 2 Cols: My Recent Submissions */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <Heading as="h2" size="h4" className="text-on-surface">
              My Recent Submissions
            </Heading>
            <Link
              href="/student/case-studies"
              className="text-small font-medium text-primary hover:underline flex items-center gap-xs"
            >
              <span>View all ({totalSubmissions})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-md">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-surface-container animate-pulse border border-outline-variant"
                />
              ))}
            </div>
          ) : myStudies.length === 0 ? (
            <Card className="p-2xl border border-dashed border-outline-variant bg-surface text-center flex flex-col items-center justify-center gap-md">
              <div className="p-lg rounded-full bg-primary/10 text-primary">
                <FolderOpen size={36} />
              </div>
              <div>
                <Heading as="h3" size="h4" className="text-on-surface">
                  No Case Studies Submitted Yet
                </Heading>
                <p className="mt-xs text-small text-on-surface-variant max-w-md mx-auto">
                  Submit your strategic management case study to begin collaborating
                  with peers, receiving feedback, and joining cohort discussions.
                </p>
              </div>
              <Link href="/student/submit">
                <Button variant="primary" className="gap-xs mt-sm">
                  <Upload size={16} />
                  Submit Your First Case Study
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-md">
              {recentStudies.map((study) => {
                const status = getDisplayStatus(study.Status);
                const fileUrl = getAttachmentUrl(study.AttachFile);

                return (
                  <Card
                    key={study.CaseStudyId}
                    className="p-lg border border-outline-variant bg-surface hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-xs mb-xs">
                        <StatusBadge status={status} size="sm" />
                        {study.SessionName && (
                          <span className="text-caption text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                            {study.SessionName}
                          </span>
                        )}
                        {study.Sector && (
                          <span className="text-caption text-on-surface-variant">
                            • {study.Sector}
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-on-surface text-body truncate">
                        {study.Title}
                      </h4>

                      <p className="text-caption text-on-surface-variant mt-0.5">
                        Submitted on {formatDate(study.SubmittedOn)}
                        {study.CountryName && ` • ${study.CountryName}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-xs shrink-0 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewStudy(study)}
                        className="gap-xs text-caption"
                        aria-label="Preview case study"
                      >
                        <Eye size={14} />
                        Preview
                      </Button>

                      {study.AttachFile && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-xs text-caption"
                            aria-label="Download attachment"
                          >
                            <Download size={14} />
                            File
                          </Button>
                        </a>
                      )}

                      <Link
                        href={`/student/discussion/${study.CaseStudyId}`}
                        aria-label="Join discussion"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-xs text-caption"
                        >
                          <MessageSquare size={14} />
                          Discussion
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Navigation & Session Resources */}
        <div className="flex flex-col gap-xl">
          {/* Quick Actions Panel */}
          <Card className="p-lg border border-outline-variant bg-surface flex flex-col gap-md">
            <div className="flex items-center gap-xs text-primary font-semibold text-small">
              <Sparkles size={16} />
              <span>Quick Navigation</span>
            </div>

            <div className="flex flex-col gap-sm">
              <Link
                href="/student/submit"
                className="p-md rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-sm">
                  <div className="p-xs rounded-lg bg-primary/10 text-primary">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-small font-semibold text-on-surface">
                      Submit Case Study
                    </p>
                    <p className="text-caption text-on-surface-variant">
                      Upload your research document
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-on-surface-variant group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <Link
                href="/student/discussion"
                className="p-md rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-sm">
                  <div className="p-xs rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-small font-semibold text-on-surface">
                      Classmates&apos; Directory
                    </p>
                    <p className="text-caption text-on-surface-variant">
                      Read approved cohort cases
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-on-surface-variant group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <Link
                href="/student/feedback"
                className="p-md rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-sm">
                  <div className="p-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Star size={18} />
                  </div>
                  <div>
                    <p className="text-small font-semibold text-on-surface">
                      Course Feedback
                    </p>
                    <p className="text-caption text-on-surface-variant">
                      Share your learning review
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-on-surface-variant group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </Card>

          {/* Session Resources Mini-Panel */}
          <Card className="p-lg border border-outline-variant bg-surface flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <Heading as="h3" size="h4" className="text-on-surface">
                Session Materials
              </Heading>
              <span className="text-caption text-on-surface-variant font-medium">
                {resources.length} files
              </span>
            </div>

            {resourcesQuery.isLoading ? (
              <div className="h-20 bg-surface-container animate-pulse rounded-lg" />
            ) : resources.length === 0 ? (
              <p className="text-caption text-on-surface-variant italic py-sm">
                No session resource documents have been uploaded for this cohort yet.
              </p>
            ) : (
              <div className="flex flex-col gap-xs max-h-60 overflow-y-auto">
                {resources.slice(0, 5).map((res) => {
                  const url = getAttachmentUrl(res.ResourceFile);
                  return (
                    <div
                      key={res.ResourceId}
                      className="p-sm rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-between gap-sm text-small"
                    >
                      <div className="flex items-center gap-xs truncate">
                        <FileText size={16} className="text-primary shrink-0" />
                        <span className="font-medium text-on-surface truncate">
                          {res.ResourceName}
                        </span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-primary hover:text-primary/80 shrink-0"
                        title="Download file"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <StudentCaseStudyPreviewModal
        isOpen={Boolean(previewStudy)}
        onClose={() => setPreviewStudy(null)}
        caseStudy={previewStudy}
      />
    </div>
  );
}
