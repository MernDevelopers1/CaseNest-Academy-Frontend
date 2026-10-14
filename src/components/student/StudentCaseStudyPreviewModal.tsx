"use client";

import Link from "next/link";
import {
  FileText,
  Calendar,
  Download,
  MessageSquare,
  Layers,
  Globe,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Modal from "/src/components/ui/Modal";
import Heading from "/src/components/ui/Heading";
import Button from "/src/components/ui/Button";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import type { CaseStudy } from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatDate,
} from "/src/lib/caseStudyTypes";

export interface StudentCaseStudyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: CaseStudy | null;
}

export default function StudentCaseStudyPreviewModal({
  isOpen,
  onClose,
  caseStudy,
}: StudentCaseStudyPreviewModalProps) {
  if (!caseStudy) return null;

  const status = getDisplayStatus(caseStudy.Status);
  const authorName =
    [caseStudy.FirstName, caseStudy.LastName].filter(Boolean).join(" ") ||
    "You";
  const attachmentUrl = getAttachmentUrl(caseStudy.AttachFile);

  let detailsText: string | null = null;
  if (caseStudy.CaseStudyinfo) {
    try {
      const parsed =
        typeof caseStudy.CaseStudyinfo === "string"
          ? JSON.parse(caseStudy.CaseStudyinfo)
          : caseStudy.CaseStudyinfo;
      if (typeof parsed === "string") {
        detailsText = parsed;
      } else if (parsed && typeof parsed === "object") {
        detailsText =
          parsed.description ||
          parsed.info ||
          parsed.CaseStudyinfo ||
          JSON.stringify(parsed, null, 2);
      }
    } catch {
      detailsText = String(caseStudy.CaseStudyinfo);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Case Study Details"
      size="lg"
    >
      <div className="flex flex-col gap-xl">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-md border-b border-outline-variant pb-lg">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-xs mb-xs">
              <StatusBadge status={status} size="sm" />
              {caseStudy.SessionName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium bg-surface-container text-on-surface-variant">
                  {caseStudy.SessionName}
                </span>
              )}
            </div>
            <Heading as="h2" size="h3" className="text-on-surface break-words">
              {caseStudy.Title}
            </Heading>
            <p className="mt-xs text-caption text-on-surface-variant flex items-center gap-xs">
              <Calendar size={14} />
              <span>Submitted on {formatDate(caseStudy.SubmittedOn)}</span>
            </p>
          </div>

          <div className="flex items-center gap-xs shrink-0">
            {caseStudy.AttachFile && (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button variant="secondary" size="sm" className="gap-xs">
                  <Download size={16} />
                  Download File
                </Button>
              </a>
            )}
            <Link
              href={`/student/discussion/${caseStudy.CaseStudyId}`}
              onClick={onClose}
            >
              <Button variant="primary" size="sm" className="gap-xs">
                <MessageSquare size={16} />
                Discussion
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div
          className={`p-md rounded-xl flex items-start gap-md border ${
            status === "Approved"
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
              : status === "Rejected"
              ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200"
              : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200"
          }`}
        >
          {status === "Approved" ? (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : status === "Rejected" ? (
            <AlertCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          ) : (
            <Clock size={20} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div className="text-small">
            <p className="font-semibold">
              {status === "Approved"
                ? "Published to Classmates"
                : status === "Rejected"
                ? "Submission Needs Revision"
                : "Submission Under Review"}
            </p>
            <p className="mt-0.5 text-caption opacity-90">
              {status === "Approved"
                ? "This case study has been approved by your tutor and is now visible to all classmates in your session for peer study and discussion."
                : status === "Rejected"
                ? "This case study was rejected by the tutor. Check the discussion thread or tutor feedback for notes and re-upload with revisions."
                : "Your case study is currently awaiting review by course tutors. Once approved, it will automatically appear in the classmate directory."}
            </p>
          </div>
        </div>

        {/* Bento Grid: Overview & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Main Description */}
          <div className="md:col-span-2 rounded-xl border border-outline-variant bg-surface-container-low p-lg flex flex-col gap-md">
            <div className="flex items-center gap-xs text-primary font-semibold">
              <FileText size={18} />
              <span>Case Study Summary & Background</span>
            </div>
            <div className="text-body text-on-surface leading-relaxed whitespace-pre-wrap">
              {detailsText || (
                <p className="text-on-surface-variant italic">
                  No additional summary provided. Please download the attached material to read the complete case study document.
                </p>
              )}
            </div>

            {caseStudy.ModelAndFramworkCoverd && (
              <div className="mt-md pt-md border-t border-outline-variant">
                <span className="text-caption font-bold uppercase text-on-surface-variant">
                  Models & Frameworks Covered
                </span>
                <p className="mt-xs text-small text-on-surface font-medium">
                  {caseStudy.ModelAndFramworkCoverd}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="rounded-xl border border-outline-variant bg-surface p-lg flex flex-col gap-md">
            <span className="text-small font-bold text-on-surface">Metadata</span>

            <div className="flex flex-col gap-sm text-small">
              <div>
                <span className="text-caption uppercase text-on-surface-variant flex items-center gap-xs">
                  <Tag size={12} /> Sector
                </span>
                <p className="font-medium text-on-surface">{caseStudy.Sector || "—"}</p>
              </div>

              <div>
                <span className="text-caption uppercase text-on-surface-variant flex items-center gap-xs">
                  <Globe size={12} /> Location
                </span>
                <p className="font-medium text-on-surface">
                  {caseStudy.CountryName || caseStudy.CountryValue || "—"}
                </p>
              </div>

              <div>
                <span className="text-caption uppercase text-on-surface-variant flex items-center gap-xs">
                  <Layers size={12} /> Attached Document
                </span>
                <p className="font-medium text-on-surface truncate">
                  {caseStudy.FileName || "Attached document"}
                </p>
              </div>

              <div className="pt-sm border-t border-outline-variant">
                <span className="text-caption uppercase text-on-surface-variant">
                  Author
                </span>
                <div className="mt-xs flex items-center gap-sm">
                  <Avatar
                    src={caseStudy.DisplayPic ?? undefined}
                    name={authorName}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-on-surface text-small">{authorName}</p>
                    <p className="text-caption text-on-surface-variant">
                      {caseStudy.RollNo ? `Roll: ${caseStudy.RollNo}` : "Enrolled Student"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-outline-variant pt-lg">
          <Button
            variant="secondary"
            onClick={onClose}
            className="border-outline-variant hover:bg-surface-container"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
