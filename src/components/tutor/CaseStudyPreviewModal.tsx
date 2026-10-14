"use client";

import Link from "next/link";
import {
  FileText,
  User,
  Calendar,
  Download,
  MessageSquare,
  Check,
  X,
  Layers,
  Globe,
  Tag,
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

export interface CaseStudyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: CaseStudy | null;
  onApprove?: (caseStudyId: number) => void;
  onReject?: (caseStudyId: number) => void;
  isUpdating?: boolean;
}

export default function CaseStudyPreviewModal({
  isOpen,
  onClose,
  caseStudy,
  onApprove,
  onReject,
  isUpdating,
}: CaseStudyPreviewModalProps) {
  if (!caseStudy) return null;

  const status = getDisplayStatus(caseStudy.Status);
  const authorName = [caseStudy.FirstName, caseStudy.LastName].filter(Boolean).join(" ") || "Student";
  const attachmentUrl = getAttachmentUrl(caseStudy.AttachFile);

  let detailsText: string | null = null;
  if (caseStudy.CaseStudyinfo) {
    try {
      const parsed = typeof caseStudy.CaseStudyinfo === "string" ? JSON.parse(caseStudy.CaseStudyinfo) : caseStudy.CaseStudyinfo;
      if (typeof parsed === "string") {
        detailsText = parsed;
      } else if (parsed && typeof parsed === "object") {
        detailsText = parsed.description || parsed.info || JSON.stringify(parsed, null, 2);
      }
    } catch {
      detailsText = String(caseStudy.CaseStudyinfo);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Case Study Submission"
      size="lg"
      className="max-w-3xl"
    >
      <div className="flex flex-col gap-xl">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-md border-b border-outline-variant pb-lg">
          <div>
            <div className="flex flex-wrap items-center gap-xs mb-xs">
              <span className="rounded-full bg-secondary-container px-md py-xs text-caption font-semibold text-on-secondary-container">
                {caseStudy.SessionName || `Session #${caseStudy.SessionId}`}
              </span>
              <StatusBadge status={status} />
            </div>
            <Heading as="h2" size="h3" className="text-primary">
              {caseStudy.Title}
            </Heading>
            <div className="mt-sm flex flex-wrap items-center gap-x-lg gap-y-xs text-caption text-on-surface-variant">
              <span className="flex items-center gap-xs">
                <User size={14} /> Author: <strong className="text-on-surface">{authorName}</strong>
              </span>
              <span className="flex items-center gap-xs">
                <Calendar size={14} /> Submitted: {formatDate(caseStudy.SubmittedOn)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-xs shrink-0">
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
            <Link href={`/tutor/discussions/${caseStudy.CaseStudyId}`} onClick={onClose}>
              <Button variant="secondary" size="sm" className="gap-xs">
                <MessageSquare size={16} />
                Discussion
              </Button>
            </Link>
          </div>
        </div>

        {/* Bento Grid: Overview & Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Main Description */}
          <div className="md:col-span-2 rounded-xl border border-outline-variant bg-surface-container-low p-lg flex flex-col gap-md">
            <div className="flex items-center gap-xs text-primary font-semibold">
              <FileText size={18} />
              <span>Submission Overview</span>
            </div>
            <div className="text-body text-on-surface leading-relaxed whitespace-pre-wrap">
              {detailsText || (
                <p className="text-on-surface-variant italic">
                  No additional summary provided. Please review the attached material document below or join the discussion.
                </p>
              )}
            </div>

            {caseStudy.ModelAndFramworkCoverd && (
              <div className="mt-md pt-md border-t border-outline-variant">
                <span className="text-caption font-bold uppercase text-on-surface-variant">
                  Models & Frameworks Covered
                </span>
                <p className="mt-xs text-small text-on-surface">
                  {caseStudy.ModelAndFramworkCoverd}
                </p>
              </div>
            )}
          </div>

          {/* Attributes Panel */}
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
                  <Layers size={12} /> File Name
                </span>
                <p className="font-medium text-on-surface truncate">
                  {caseStudy.FileName || "Attached document"}
                </p>
              </div>

              <div className="pt-sm border-t border-outline-variant">
                <span className="text-caption uppercase text-on-surface-variant">
                  Student Details
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
                      {caseStudy.Specialization || caseStudy.Education || "Enrolled Student"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-md border-t border-outline-variant pt-lg">
          <div className="text-caption text-on-surface-variant">
            {status === "Approved" ? (
              <span className="text-success font-semibold">✓ Visible to all classmates in directory</span>
            ) : status === "Rejected" ? (
              <span className="text-error font-semibold">✕ Hidden from classmates directory</span>
            ) : (
              <span>Review submission and approve to publish for classmate discussions.</span>
            )}
          </div>

          <div className="flex items-center gap-sm w-full sm:w-auto">
            {status !== "Approved" && onApprove && (
              <Button
                variant="primary"
                onClick={() => onApprove(caseStudy.CaseStudyId)}
                loading={isUpdating}
                className="gap-xs flex-1 sm:flex-none"
              >
                <Check size={16} />
                Approve Case Study
              </Button>
            )}

            {status !== "Rejected" && onReject && (
              <Button
                variant="secondary"
                onClick={() => onReject(caseStudy.CaseStudyId)}
                loading={isUpdating}
                className="gap-xs flex-1 sm:flex-none text-error border-error/50 hover:bg-error-container hover:text-on-error-container"
              >
                <X size={16} />
                Reject
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isUpdating}
              className="border-transparent hover:bg-surface-container"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
