"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Check,
  X,
  Download,
  MessageSquare,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";
import Card from "/src/components/ui/Card";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";
import CaseStudyPreviewModal from "/src/components/tutor/CaseStudyPreviewModal";
import type {
  CaseStudy,
  CaseStudyStatus,
  TeacherDataResponse,
  TeacherSession,
} from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatRelativeTime,
} from "/src/lib/caseStudyTypes";

type FilterTab = "ALL" | "Pending" | "Approved" | "Rejected";

export default function TutorCaseStudiesPage() {
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [previewCaseStudy, setPreviewCaseStudy] = useState<CaseStudy | null>(null);

  // 1. Fetch teacher sessions
  const sessionsQuery = useQuery({
    queryKey: ["teacher-sessions", user?.id],
    queryFn: () => apiFetch<TeacherSession[]>(`/teachersession?Id=${user?.id}`),
    enabled: Boolean(user?.id),
  });

  // 2. Fetch case studies (either for a selected session or all teacher case studies)
  const caseStudiesQuery = useQuery({
    queryKey: ["teacher-case-studies", user?.id, selectedSessionId],
    queryFn: async (): Promise<CaseStudy[]> => {
      if (selectedSessionId !== "ALL") {
        return apiFetch<CaseStudy[]>(`/teachercasestudy?SessionId=${selectedSessionId}`);
      }
      const res = await apiFetch<TeacherDataResponse>(`/teacherdata?Id=${user?.id}`);
      return res.CaseStudy || [];
    },
    enabled: Boolean(user?.id),
  });

  // 3. Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({
      CaseStudyId,
      Status,
    }: {
      CaseStudyId: number;
      Status: CaseStudyStatus;
    }) =>
      apiFetch<{ success: boolean; CaseStudyId: number; Status: CaseStudyStatus }>(
        "/CaseStudyStatus",
        {
          method: "PATCH",
          body: JSON.stringify({ CaseStudyId, Status }),
        },
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["all-case-study"] });

      if (previewCaseStudy && previewCaseStudy.CaseStudyId === variables.CaseStudyId) {
        setPreviewCaseStudy((prev) => (prev ? { ...prev, Status: variables.Status } : null));
      }

      showToast({
        variant: "success",
        message:
          variables.Status === "Approved"
            ? "Case study approved and published for classmates."
            : variables.Status === "Rejected"
            ? "Case study rejected."
            : "Case study set to pending.",
      });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to update case study status.",
      });
    },
  });

  const allStudies = useMemo(() => caseStudiesQuery.data ?? [], [caseStudiesQuery.data]);

  // Filter logic
  const filteredStudies = useMemo(() => {
    return allStudies.filter((study) => {
      const status = getDisplayStatus(study.Status);

      // Status tab filter
      if (activeTab !== "ALL" && status !== activeTab) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = study.Title?.toLowerCase().includes(q);
        const sectorMatch = study.Sector?.toLowerCase().includes(q);
        const frameworkMatch = study.ModelAndFramworkCoverd?.toLowerCase().includes(q);
        const authorMatch = `${study.FirstName || ""} ${study.LastName || ""}`
          .toLowerCase()
          .includes(q);

        if (!titleMatch && !sectorMatch && !frameworkMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allStudies, activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      ALL: allStudies.length,
      Pending: allStudies.filter((s) => getDisplayStatus(s.Status) === "Pending").length,
      Approved: allStudies.filter((s) => getDisplayStatus(s.Status) === "Approved").length,
      Rejected: allStudies.filter((s) => getDisplayStatus(s.Status) === "Rejected").length,
    };
  }, [allStudies]);

  const handleApprove = (id: number) => {
    statusMutation.mutate({ CaseStudyId: id, Status: "Approved" });
  };

  const handleReject = (id: number) => {
    statusMutation.mutate({ CaseStudyId: id, Status: "Rejected" });
  };

  return (
    <div className="flex flex-col gap-xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg border-b border-outline-variant pb-md">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Case Study Directory
          </Heading>
          <Text size="body" className="mt-xs text-on-surface-variant">
            Review student submissions, manage approvals, and direct discussion threads.
          </Text>
        </div>

        <div className="flex items-center gap-xs rounded-full bg-secondary-container px-md py-xs text-caption font-semibold text-on-secondary-container self-start md:self-auto">
          <span>Tutor Review Mode</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-md">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Input
              id="search-studies"
              placeholder="Search by title, author, sector, or framework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search size={18} className="absolute left-3 top-3.5 text-on-surface-variant pointer-events-none" />
          </div>

          {/* Session Dropdown */}
          <div className="w-full md:w-64">
            <Select
              id="filter-session"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              options={[
                { value: "ALL", label: "All Assigned Sessions" },
                ...(sessionsQuery.data || []).map((s) => ({
                  value: String(s.SessionId),
                  label: s.SessionName,
                })),
              ]}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-xs border-b border-outline-variant pb-xs">
          {(
            [
              { key: "ALL", label: "All Submissions", count: counts.ALL, icon: Layers },
              { key: "Pending", label: "Pending Review", count: counts.Pending, icon: Clock },
              { key: "Approved", label: "Approved", count: counts.Approved, icon: CheckCircle2 },
              { key: "Rejected", label: "Rejected", count: counts.Rejected, icon: XCircle },
            ] as const
          ).map(({ key, label, count, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-xs rounded-lg px-lg py-sm text-small font-medium transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
                <span
                  className={`ml-xs rounded-full px-2 py-0.5 text-caption ${
                    isActive
                      ? "bg-on-primary/20 text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Studies List */}
      {caseStudiesQuery.isLoading ? (
        <div className="flex flex-col gap-lg">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 w-full animate-pulse rounded-xl border border-outline-variant bg-surface-container-low"
            />
          ))}
        </div>
      ) : caseStudiesQuery.isError ? (
        <Card padding="lg" className="text-center p-xl">
          <AlertCircle size={40} className="mx-auto mb-sm text-error" />
          <Heading as="h3" size="h4" className="text-on-surface">
            Unable to load case studies
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            Please check your network connection and try again.
          </Text>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => caseStudiesQuery.refetch()}
            className="mt-md"
          >
            Retry
          </Button>
        </Card>
      ) : filteredStudies.length === 0 ? (
        <Card padding="lg" className="text-center p-xl">
          <FileText size={48} className="mx-auto mb-sm text-on-surface-variant opacity-40" />
          <Heading as="h3" size="h4" className="text-on-surface">
            No case studies found
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant max-w-md mx-auto">
            {searchQuery.trim() || activeTab !== "ALL"
              ? "No case studies match your active search and filter criteria. Try adjusting the search term or switching tabs."
              : "No students have submitted case studies in your assigned sessions yet."}
          </Text>
          {(searchQuery || activeTab !== "ALL") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
              }}
              className="mt-md"
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-lg">
          {filteredStudies.map((study) => {
            const status = getDisplayStatus(study.Status);
            const authorName = [study.FirstName, study.LastName].filter(Boolean).join(" ") || "Student";
            const attachmentUrl = getAttachmentUrl(study.AttachFile);
            const isUpdating =
              statusMutation.isPending &&
              statusMutation.variables?.CaseStudyId === study.CaseStudyId;

            return (
              <div
                key={study.CaseStudyId}
                className={`rounded-xl border border-outline-variant bg-surface p-lg md:p-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(43,9,87,0.06)] ${
                  status === "Pending"
                    ? "border-l-4 border-l-warning"
                    : status === "Approved"
                    ? "border-l-4 border-l-success"
                    : "border-l-4 border-l-error opacity-80"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-lg">
                  {/* Left Column: Details */}
                  <div className="flex-1">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-sm mb-sm">
                      <StatusBadge status={status} />

                      <span className="flex items-center gap-xs text-caption text-on-surface-variant font-medium">
                        <Calendar size={14} />
                        {study.SessionName || `Session #${study.SessionId}`}
                      </span>

                      <span className="text-caption text-on-surface-variant">
                        • Submitted {formatRelativeTime(study.SubmittedOn)}
                      </span>

                      {study.Sector && (
                        <span className="rounded bg-surface-container px-2 py-0.5 text-caption font-semibold text-on-surface-variant">
                          {study.Sector}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-h4 text-on-surface hover:text-primary transition-colors cursor-pointer mb-xs" onClick={() => setPreviewCaseStudy(study)}>
                      {study.Title}
                    </h3>

                    {/* Models / Summary Snippet */}
                    {study.ModelAndFramworkCoverd && (
                      <p className="text-small text-on-surface-variant line-clamp-2 mb-md">
                        <strong className="font-semibold text-on-surface">Frameworks:</strong> {study.ModelAndFramworkCoverd}
                      </p>
                    )}

                    {/* Author Meta */}
                    <div className="flex items-center gap-md mt-sm">
                      <Avatar
                        src={study.DisplayPic ?? undefined}
                        name={authorName}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-small text-on-surface leading-tight">
                          {authorName}
                        </p>
                        <p className="text-caption text-on-surface-variant">
                          {study.Specialization || study.Education || "Enrolled Student"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex md:flex-col gap-sm justify-end md:justify-start flex-wrap mt-md md:mt-0 md:min-w-[160px] border-t md:border-t-0 border-outline-variant pt-md md:pt-0">
                    {/* Approval Controls */}
                    {status === "Pending" ? (
                      <div className="flex gap-xs w-full">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(study.CaseStudyId)}
                          loading={isUpdating}
                          className="flex-1 gap-xs text-small"
                        >
                          <Check size={16} />
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReject(study.CaseStudyId)}
                          loading={isUpdating}
                          className="flex-1 gap-xs text-small text-error border-error/50 hover:bg-error-container hover:text-on-error-container"
                        >
                          <X size={16} />
                          Reject
                        </Button>
                      </div>
                    ) : status === "Approved" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReject(study.CaseStudyId)}
                        loading={isUpdating}
                        className="w-full gap-xs text-error border-error/40 hover:bg-error-container hover:text-on-error-container text-caption"
                      >
                        <X size={14} />
                        Revoke Approval
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(study.CaseStudyId)}
                        loading={isUpdating}
                        className="w-full gap-xs text-small"
                      >
                        <Check size={14} />
                        Re-Approve
                      </Button>
                    )}

                    {/* Download File */}
                    {study.AttachFile && (
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="w-full"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full gap-xs text-small"
                        >
                          <Download size={15} />
                          Download
                        </Button>
                      </a>
                    )}

                    {/* Go to Discussion */}
                    <Link
                      href={`/tutor/discussions/${study.CaseStudyId}`}
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-xs text-small"
                      >
                        <MessageSquare size={15} />
                        Discussion
                      </Button>
                    </Link>

                    {/* Preview Details Trigger */}
                    <button
                      type="button"
                      onClick={() => setPreviewCaseStudy(study)}
                      className="w-full text-center text-caption text-primary font-semibold hover:underline mt-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Study Preview Modal */}
      <CaseStudyPreviewModal
        isOpen={Boolean(previewCaseStudy)}
        onClose={() => setPreviewCaseStudy(null)}
        caseStudy={previewCaseStudy}
        onApprove={handleApprove}
        onReject={handleReject}
        isUpdating={statusMutation.isPending}
      />
    </div>
  );
}
