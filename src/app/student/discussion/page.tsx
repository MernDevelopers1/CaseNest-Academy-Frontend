"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  BookOpen,
  Eye,
  Download,
  Layers,
  Globe,
  Tag,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserId, getUserSessionId, getUserSessionName } from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import Avatar from "/src/components/ui/Avatar";
import { apiFetch } from "/src/lib/api";
import type { CaseStudy } from "/src/lib/caseStudyTypes";
import { getAttachmentUrl } from "/src/lib/caseStudyTypes";
import {
  getReadStudyIds,
  toggleStudyRead,
} from "/src/lib/readStudies";
import StudentCaseStudyPreviewModal from "/src/components/student/StudentCaseStudyPreviewModal";

type ReadFilter = "all" | "unread" | "read";

export default function StudentDiscussionDirectoryPage() {
  const { user } = useAuthContext();
  const userId = getUserId(user);
  const sessionId = getUserSessionId(user);
  const sessionName = getUserSessionName(user);

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [readIds, setReadIds] = useState<Set<number>>(() => getReadStudyIds(userId));
  const [previewStudy, setPreviewStudy] = useState<CaseStudy | null>(null);

  // Synchronize read state on events
  useEffect(() => {
    const handleReadChanged = () => {
      setReadIds(getReadStudyIds(userId));
    };

    window.addEventListener("casenest:read-studies-changed", handleReadChanged);
    return () => {
      window.removeEventListener("casenest:read-studies-changed", handleReadChanged);
    };
  }, [userId]);

  // Fetch approved case studies
  const { data, isLoading } = useQuery({
    queryKey: ["student-classmate-case-studies", sessionId],
    queryFn: () =>
      apiFetch<CaseStudy[]>(
        sessionId
          ? `/GetAllCaseStudies?SessionId=${sessionId}&onlyApproved=true`
          : "/AllCaseStudy?onlyApproved=true"
      ),
  });

  const studies = useMemo(() => data ?? [], [data]);

  // Handle Mark as Read toggle
  const handleToggleRead = (caseStudyId: number) => {
    toggleStudyRead(userId, caseStudyId);
    setReadIds(getReadStudyIds(userId));
  };

  // Filtered studies
  const filteredStudies = useMemo(() => {
    return studies.filter((s) => {
      const isRead = readIds.has(s.CaseStudyId);

      if (readFilter === "read" && !isRead) return false;
      if (readFilter === "unread" && isRead) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const title = (s.Title || "").toLowerCase();
      const author = `${s.FirstName || ""} ${s.LastName || ""}`.toLowerCase();
      const sector = (s.Sector || "").toLowerCase();
      const country = (s.CountryName || s.CountryValue || "").toLowerCase();
      const model = (s.ModelAndFramworkCoverd || "").toLowerCase();
      const session = (s.SessionName || "").toLowerCase();

      return (
        title.includes(term) ||
        author.includes(term) ||
        sector.includes(term) ||
        country.includes(term) ||
        model.includes(term) ||
        session.includes(term)
      );
    });
  }, [studies, readFilter, search, readIds]);

  const readCount = useMemo(
    () => studies.filter((s) => readIds.has(s.CaseStudyId)).length,
    [studies, readIds]
  );
  const unreadCount = studies.length - readCount;

  return (
    <div className="flex flex-col gap-xl max-w-7xl mx-auto pb-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant pb-lg">
        <div>
          <Heading as="h1" size="h2" className="text-on-surface">
            Classmate Case Studies
          </Heading>
          <p className="mt-xs text-small text-on-surface-variant">
            Explore approved peer research papers from your cohort, track your reading progress, and join discussions.
          </p>
        </div>

        {sessionName && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-caption font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
            Cohort: {sessionName}
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, sector, or framework..."
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 text-small text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/60"
          />
        </div>

        {/* Read Filter Tabs */}
        <div className="flex items-center gap-xs p-1 rounded-xl bg-surface-container border border-outline-variant text-caption">
          <button
            type="button"
            onClick={() => setReadFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              readFilter === "all"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Papers ({studies.length})
          </button>
          <button
            type="button"
            onClick={() => setReadFilter("unread")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              readFilter === "unread"
                ? "bg-surface text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setReadFilter("read")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              readFilter === "read"
                ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-surface-container animate-pulse border border-outline-variant"
            />
          ))}
        </div>
      ) : studies.length === 0 ? (
        <Card className="p-2xl border border-dashed border-outline-variant bg-surface text-center flex flex-col items-center justify-center gap-md">
          <div className="p-lg rounded-full bg-primary/10 text-primary">
            <BookOpen size={40} />
          </div>
          <div>
            <Heading as="h2" size="h4" className="text-on-surface">
              No Approved Case Studies Yet
            </Heading>
            <p className="mt-xs text-small text-on-surface-variant max-w-md mx-auto">
              Once submissions from you and your peers are reviewed and approved by the course tutor, they will appear here.
            </p>
          </div>
          <Link href="/student/submit">
            <Button variant="primary" className="gap-xs mt-sm">
              Submit Your Case Study
            </Button>
          </Link>
        </Card>
      ) : filteredStudies.length === 0 ? (
        <Card className="p-xl border border-outline-variant bg-surface text-center flex flex-col items-center justify-center gap-sm">
          <Search size={32} className="text-on-surface-variant opacity-40" />
          <p className="font-semibold text-on-surface">No matching case studies</p>
          <p className="text-caption text-on-surface-variant">
            Try adjusting your search terms or filter.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setReadFilter("all");
            }}
            className="mt-xs"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {filteredStudies.map((study) => {
            const isRead = readIds.has(study.CaseStudyId);
            const authorName =
              [study.FirstName, study.LastName].filter(Boolean).join(" ") ||
              "Cohort Student";
            const fileUrl = getAttachmentUrl(study.AttachFile);

            return (
              <Card
                key={study.CaseStudyId}
                className={`p-lg border rounded-2xl flex flex-col justify-between transition-all hover:shadow-md ${
                  isRead
                    ? "border-outline-variant bg-surface opacity-95"
                    : "border-primary/30 bg-surface shadow-xs"
                }`}
              >
                {/* Card Top: Author & Read Toggle */}
                <div className="flex flex-col gap-sm">
                  <div className="flex items-center justify-between gap-sm">
                    <div className="flex items-center gap-sm">
                      <Avatar
                        src={study.DisplayPic ?? undefined}
                        name={authorName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-small text-on-surface leading-tight">
                          {authorName}
                        </p>
                        <p className="text-caption text-on-surface-variant">
                          {study.Specialization || study.Education || "Cohort Student"}
                        </p>
                      </div>
                    </div>

                    {/* Mark as Read Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleRead(study.CaseStudyId)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium transition-colors ${
                        isRead
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                      }`}
                      title={isRead ? "Click to mark unread" : "Click to mark as read"}
                    >
                      {isRead ? (
                        <>
                          <CheckSquare size={14} className="text-emerald-500" />
                          <span>Read</span>
                        </>
                      ) : (
                        <>
                          <Square size={14} />
                          <span>Mark Read</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-xs">
                    <h3 className="font-semibold text-body text-on-surface line-clamp-2">
                      {study.Title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-xs mt-xs text-caption text-on-surface-variant">
                      {study.Sector && (
                        <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md">
                          <Tag size={11} />
                          {study.Sector}
                        </span>
                      )}
                      {(study.CountryName || study.CountryValue) && (
                        <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md">
                          <Globe size={11} />
                          {study.CountryName || study.CountryValue}
                        </span>
                      )}
                      {study.SessionName && (
                        <span className="bg-surface-container px-2 py-0.5 rounded-md">
                          {study.SessionName}
                        </span>
                      )}
                    </div>

                    {study.ModelAndFramworkCoverd && (
                      <p className="text-caption text-on-surface-variant mt-sm line-clamp-1 flex items-center gap-xs">
                        <Layers size={13} className="shrink-0" />
                        <span>{study.ModelAndFramworkCoverd}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Actions */}
                <div className="flex items-center justify-between gap-sm border-t border-outline-variant pt-md mt-md">
                  <div className="flex items-center gap-xs">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewStudy(study)}
                      className="gap-xs text-caption"
                      aria-label="Preview details"
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
                          aria-label="Download paper"
                        >
                          <Download size={14} />
                          File
                        </Button>
                      </a>
                    )}
                  </div>

                  <Link href={`/student/discussion/${study.CaseStudyId}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-xs text-caption shadow-xs"
                    >
                      <MessageSquare size={14} />
                      Discuss
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <StudentCaseStudyPreviewModal
        isOpen={Boolean(previewStudy)}
        onClose={() => setPreviewStudy(null)}
        caseStudy={previewStudy}
      />
    </div>
  );
}
