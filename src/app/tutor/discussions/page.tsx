"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { apiFetch } from "/src/lib/api";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";
import Card from "/src/components/ui/Card";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";
import type {
  CaseStudy,
  TeacherDataResponse,
  TeacherSession,
} from "/src/lib/caseStudyTypes";
import { getDisplayStatus, formatRelativeTime } from "/src/lib/caseStudyTypes";

export default function TutorDiscussionsDirectoryPage() {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("ALL");

  // Fetch teacher sessions
  const sessionsQuery = useQuery({
    queryKey: ["teacher-sessions", user?.id],
    queryFn: () => apiFetch<TeacherSession[]>(`/teachersession?Id=${user?.id}`),
    enabled: Boolean(user?.id),
  });

  // Fetch teacher case studies
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

  const studies = useMemo(() => caseStudiesQuery.data ?? [], [caseStudiesQuery.data]);

  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = study.Title?.toLowerCase().includes(q);
      const sectorMatch = study.Sector?.toLowerCase().includes(q);
      const authorMatch = `${study.FirstName || ""} ${study.LastName || ""}`
        .toLowerCase()
        .includes(q);
      return titleMatch || sectorMatch || authorMatch;
    });
  }, [studies, searchQuery]);

  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg border-b border-outline-variant pb-md">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Discussion Threads
          </Heading>
          <Text size="body" className="mt-xs text-on-surface-variant">
            Participate in collaborative peer discussions, answer student questions, and moderate forum threads.
          </Text>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-md">
        <div className="flex-1 relative">
          <Input
            id="search-discussions"
            placeholder="Search discussions by case study title, author, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-on-surface-variant pointer-events-none" />
        </div>

        <div className="w-full md:w-64">
          <Select
            id="filter-discussions-session"
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

      {/* Discussion Cards Grid */}
      {caseStudiesQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 w-full animate-pulse rounded-xl border border-outline-variant bg-surface-container-low"
            />
          ))}
        </div>
      ) : filteredStudies.length === 0 ? (
        <Card padding="lg" className="text-center p-xl">
          <MessageSquare size={48} className="mx-auto mb-sm text-on-surface-variant opacity-40" />
          <Heading as="h3" size="h4" className="text-on-surface">
            No discussion threads found
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant max-w-md mx-auto">
            {searchQuery.trim()
              ? "No case studies match your search. Try a different keyword."
              : "When students submit case studies, their dedicated discussion threads will appear here."}
          </Text>
          {searchQuery && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-md"
            >
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {filteredStudies.map((study) => {
            const status = getDisplayStatus(study.Status);
            const authorName =
              [study.FirstName, study.LastName].filter(Boolean).join(" ") || "Student";

            return (
              <Card
                key={study.CaseStudyId}
                padding="lg"
                className="flex flex-col justify-between hover:border-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(43,9,87,0.06)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-sm mb-xs">
                    <span className="rounded-full bg-secondary-container px-md py-xs text-caption font-semibold text-on-secondary-container">
                      {study.SessionName || `Session #${study.SessionId}`}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  <Link href={`/tutor/discussions/${study.CaseStudyId}`}>
                    <Heading
                      as="h3"
                      size="h4"
                      className="text-on-surface hover:text-primary transition-colors cursor-pointer mt-sm line-clamp-1"
                    >
                      {study.Title}
                    </Heading>
                  </Link>

                  {study.ModelAndFramworkCoverd ? (
                    <Text size="small" className="mt-xs text-on-surface-variant line-clamp-2">
                      {study.ModelAndFramworkCoverd}
                    </Text>
                  ) : (
                    <Text size="small" className="mt-xs text-on-surface-variant italic">
                      Case study discussion thread for peer feedback and review.
                    </Text>
                  )}

                  <div className="flex items-center gap-md mt-md pt-md border-t border-outline-variant">
                    <Avatar
                      src={study.DisplayPic ?? undefined}
                      name={authorName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-small text-on-surface truncate">
                        {authorName}
                      </p>
                      <p className="text-caption text-on-surface-variant">
                        Submitted {formatRelativeTime(study.SubmittedOn)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-lg pt-sm flex items-center justify-between">
                  <span className="text-caption font-medium text-on-surface-variant flex items-center gap-xs">
                    <MessageSquare size={15} /> Open Forum
                  </span>

                  <Link href={`/tutor/discussions/${study.CaseStudyId}`}>
                    <Button variant="secondary" size="sm" className="gap-xs">
                      Join Discussion
                      <ArrowRight size={15} />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
