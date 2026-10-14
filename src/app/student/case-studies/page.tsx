"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Upload,
  Eye,
  Download,
  MessageSquare,
  Trash2,
  Calendar,
  Layers,
  Globe,
  Tag,
  FolderOpen,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserId } from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import StatusBadge from "/src/components/ui/StatusBadge";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import type { CaseStudy } from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatDate,
} from "/src/lib/caseStudyTypes";
import StudentCaseStudyPreviewModal from "/src/components/student/StudentCaseStudyPreviewModal";

type StatusFilter = "all" | "Approved" | "Pending" | "Rejected";

export default function StudentCaseStudiesPage() {
  const { user } = useAuthContext();
  const userId = getUserId(user);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [previewStudy, setPreviewStudy] = useState<CaseStudy | null>(null);
  const [deletingStudy, setDeletingStudy] = useState<CaseStudy | null>(null);

  // Fetch student's own case studies
  const { data, isLoading } = useQuery({
    queryKey: ["student-my-case-studies", userId],
    queryFn: () => apiFetch<CaseStudy[]>(`/AddCaseStudy?UserId=${userId}`),
    enabled: Boolean(userId),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (study: CaseStudy) =>
      apiFetch<{ success: boolean }>(`/AddCaseStudy?CaseStudyId=${study.CaseStudyId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-my-case-studies", userId] });
      showToast({
        variant: "success",
        message: "Case study deleted successfully.",
      });
      setDeletingStudy(null);
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to delete case study.",
      });
      setDeletingStudy(null);
    },
  });

  const studies = useMemo(() => data ?? [], [data]);

  // Counts for tabs
  const counts = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    studies.forEach((s) => {
      const st = getDisplayStatus(s.Status);
      if (st === "Approved") approved++;
      else if (st === "Rejected") rejected++;
      else pending++;
    });
    return { all: studies.length, approved, pending, rejected };
  }, [studies]);

  // Filtered studies
  const filteredStudies = useMemo(() => {
    return studies.filter((s) => {
      const status = getDisplayStatus(s.Status);
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const title = (s.Title || "").toLowerCase();
      const sector = (s.Sector || "").toLowerCase();
      const country = (s.CountryName || s.CountryValue || "").toLowerCase();
      const model = (s.ModelAndFramworkCoverd || "").toLowerCase();
      const session = (s.SessionName || "").toLowerCase();

      return (
        title.includes(term) ||
        sector.includes(term) ||
        country.includes(term) ||
        model.includes(term) ||
        session.includes(term)
      );
    });
  }, [studies, statusFilter, search]);

  return (
    <div className="flex flex-col gap-xl max-w-7xl mx-auto pb-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant pb-lg">
        <div>
          <Heading as="h1" size="h2" className="text-on-surface">
            My Case Studies
          </Heading>
          <p className="mt-xs text-small text-on-surface-variant">
            Manage your submitted research papers, track tutor review status, and join peer discussions.
          </p>
        </div>

        <Link href="/student/submit">
          <Button variant="primary" className="gap-xs shadow-sm shrink-0">
            <Upload size={16} />
            Submit New Case Study
          </Button>
        </Link>
      </div>

      {/* Search and Status Tabs Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, sector, country, or model..."
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 text-small text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/60"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-xs overflow-x-auto p-1 rounded-xl bg-surface-container border border-outline-variant text-caption">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Approved")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-xs ${
              statusFilter === "Approved"
                ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Approved ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-xs ${
              statusFilter === "Pending"
                ? "bg-surface text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending ({counts.pending})
          </button>
          {counts.rejected > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("Rejected")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-xs ${
                statusFilter === "Rejected"
                  ? "bg-surface text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Needs Revision ({counts.rejected})
            </button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="flex flex-col gap-md">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-surface-container animate-pulse border border-outline-variant"
            />
          ))}
        </div>
      ) : studies.length === 0 ? (
        <Card className="p-2xl border border-dashed border-outline-variant bg-surface text-center flex flex-col items-center justify-center gap-md">
          <div className="p-lg rounded-full bg-primary/10 text-primary">
            <FolderOpen size={40} />
          </div>
          <div>
            <Heading as="h2" size="h4" className="text-on-surface">
              No Case Studies Uploaded
            </Heading>
            <p className="mt-xs text-small text-on-surface-variant max-w-md mx-auto">
              You haven&apos;t submitted any case studies yet. Click the button below to upload your first paper.
            </p>
          </div>
          <Link href="/student/submit">
            <Button variant="primary" className="gap-xs mt-sm">
              <Upload size={16} />
              Submit Case Study
            </Button>
          </Link>
        </Card>
      ) : filteredStudies.length === 0 ? (
        <Card className="p-xl border border-outline-variant bg-surface text-center flex flex-col items-center justify-center gap-sm">
          <Search size={32} className="text-on-surface-variant opacity-40" />
          <p className="font-semibold text-on-surface">No matching case studies</p>
          <p className="text-caption text-on-surface-variant">
            Try adjusting your search keywords or status filter.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-xs"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-md">
          {filteredStudies.map((study) => {
            const status = getDisplayStatus(study.Status);
            const fileUrl = getAttachmentUrl(study.AttachFile);

            return (
              <Card
                key={study.CaseStudyId}
                className="p-lg border border-outline-variant bg-surface hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-md shadow-xs"
              >
                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col gap-xs">
                  <div className="flex flex-wrap items-center gap-xs">
                    <StatusBadge status={status} size="sm" />

                    {study.SessionName && (
                      <span className="text-caption text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full font-medium">
                        {study.SessionName}
                      </span>
                    )}

                    {study.Sector && (
                      <span className="inline-flex items-center gap-1 text-caption text-on-surface-variant">
                        <Tag size={12} />
                        {study.Sector}
                      </span>
                    )}

                    {(study.CountryName || study.CountryValue) && (
                      <span className="inline-flex items-center gap-1 text-caption text-on-surface-variant">
                        <Globe size={12} />
                        {study.CountryName || study.CountryValue}
                      </span>
                    )}
                  </div>

                  <h3 className="text-body font-semibold text-on-surface break-words">
                    {study.Title}
                  </h3>

                  {study.ModelAndFramworkCoverd && (
                    <p className="text-caption text-on-surface-variant flex items-center gap-xs">
                      <Layers size={13} className="shrink-0" />
                      <span>{study.ModelAndFramworkCoverd}</span>
                    </p>
                  )}

                  <p className="text-caption text-on-surface-variant flex items-center gap-xs mt-0.5">
                    <Calendar size={13} className="shrink-0" />
                    <span>Submitted on {formatDate(study.SubmittedOn)}</span>
                  </p>
                </div>

                {/* Actions Column */}
                <div className="flex flex-wrap items-center gap-xs shrink-0 pt-sm md:pt-0 border-t md:border-t-0 border-outline-variant">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewStudy(study)}
                    className="gap-xs text-small"
                    aria-label="Preview details"
                  >
                    <Eye size={15} />
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
                        className="gap-xs text-small"
                        aria-label="Download document"
                      >
                        <Download size={15} />
                        File
                      </Button>
                    </a>
                  )}

                  <Link href={`/student/discussion/${study.CaseStudyId}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-xs text-small"
                      aria-label="Open discussion"
                    >
                      <MessageSquare size={15} />
                      Discussion
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDeletingStudy(study)}
                    className="text-error border-error/40 hover:bg-error-container hover:text-on-error-container p-2"
                    aria-label="Delete case study"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingStudy)}
        onClose={() => setDeletingStudy(null)}
        onConfirm={() => {
          if (deletingStudy) {
            deleteMutation.mutate(deletingStudy);
          }
        }}
        title="Delete Case Study"
        message={`Are you sure you want to delete "${deletingStudy?.Title}"? This will permanently remove the submission and any attached files. This action cannot be undone.`}
        confirmLabel="Delete Submission"
        variant="danger"
      />

      {/* Preview Modal */}
      <StudentCaseStudyPreviewModal
        isOpen={Boolean(previewStudy)}
        onClose={() => setPreviewStudy(null)}
        caseStudy={previewStudy}
      />
    </div>
  );
}
