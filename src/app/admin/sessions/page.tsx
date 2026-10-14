"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CalendarDays,
  Folder,
  FileText,
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import IconButton from "/src/components/ui/IconButton";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { formatResourceDate } from "/src/lib/sessionTypes";
import type { Session } from "/src/lib/sessionTypes";
import SessionModal from "/src/components/admin/sessions/SessionModal";

export default function AdminSessionsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch<Session[]>("/AddSession"),
  });

  const deleteMutation = useMutation({
    mutationFn: (session: Session) =>
      apiFetch<{ message: string }>(`/AddSession?SessionId=${session.SessionId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showToast({ variant: "success", message: "Session deleted successfully." });
      setDeletingSession(null);
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to delete this session. Please try again.",
      });
      setDeletingSession(null);
    },
  });

  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);

  // Unique years for filter dropdown
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.SessionYear) set.add(String(s.SessionYear));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [sessions]);

  // KPIs
  const currentYear = new Date().getFullYear();
  const totalSessions = sessions.length;
  const currentYearCount = useMemo(
    () => sessions.filter((s) => String(s.SessionYear) === String(currentYear)).length,
    [sessions, currentYear],
  );
  const totalEnrolled = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.StudentCount || 0), 0),
    [sessions],
  );

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchYear = yearFilter === "all" || String(s.SessionYear) === yearFilter;
      if (!matchYear) return false;
      if (!search.trim()) return true;

      const term = search.toLowerCase();
      const nameMatch = s.SessionName?.toLowerCase().includes(term);
      const yearMatch = String(s.SessionYear).toLowerCase().includes(term);
      const fieldsMatch = s.SessionFields?.toLowerCase().includes(term);
      return Boolean(nameMatch || yearMatch || fieldsMatch);
    });
  }, [sessions, yearFilter, search]);

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSession(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-xl max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h1 className="text-h1-mobile md:text-h1 font-bold text-on-background">
            Sessions
          </h1>
          <p className="text-body text-on-surface-variant mt-xs">
            Manage active and past collaborative learning sessions, resources, and enrollments.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
          className="flex items-center gap-sm shrink-0 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Session
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Total Sessions */}
        <Card className="flex items-center gap-lg p-lg">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Sessions
            </p>
            <p className="text-h2 font-bold text-on-surface">
              {sessionsQuery.isLoading ? "—" : totalSessions}
            </p>
            <p className="text-caption text-on-surface-variant mt-0.5">
              Across all academic years
            </p>
          </div>
        </Card>

        {/* Current Year */}
        <Card className="flex items-center gap-lg p-lg">
          <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Active in {currentYear}
            </p>
            <p className="text-h2 font-bold text-on-surface">
              {sessionsQuery.isLoading ? "—" : currentYearCount}
            </p>
            <p className="text-caption text-on-surface-variant mt-0.5">
              Current academic term sessions
            </p>
          </div>
        </Card>

        {/* Total Enrolled Students */}
        <Card className="flex items-center gap-lg p-lg">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Enrolled Students
            </p>
            <p className="text-h2 font-bold text-on-surface">
              {sessionsQuery.isLoading ? "—" : totalEnrolled}
            </p>
            <p className="text-caption text-on-surface-variant mt-0.5">
              Active student enrollments
            </p>
          </div>
        </Card>
      </div>

      {/* Toolbar: Search and Filter */}
      <Card className="p-md flex flex-col sm:flex-row gap-md items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by session name or code..."
            className="w-full pl-11 pr-md py-sm bg-surface-container-low border border-outline/20 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="flex items-center gap-sm w-full sm:w-auto">
          <span className="text-small font-medium text-on-surface-variant shrink-0">
            Filter Year:
          </span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-md py-sm rounded-xl bg-surface-container-low border border-outline/20 text-small text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Sessions Grid */}
      {sessionsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-outline/20 bg-surface-container animate-pulse"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4xl text-center bg-surface border border-dashed border-outline/30 rounded-2xl p-xl">
          <div className="w-20 h-20 mb-lg bg-surface-container rounded-full flex items-center justify-center text-outline">
            <CalendarDays className="w-10 h-10" />
          </div>
          <h3 className="text-h2 font-bold text-on-surface mb-xs">
            {search || yearFilter !== "all" ? "No matching sessions" : "No Sessions Found"}
          </h3>
          <p className="text-body text-on-surface-variant max-w-md mb-xl">
            {search || yearFilter !== "all"
              ? "We couldn't find any session matching your current search or year filter."
              : "It looks like you haven't created any learning sessions yet. Get started by adding a new one."}
          </p>
          {search || yearFilter !== "all" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setYearFilter("all");
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAdd}>
              Create First Session
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredSessions.map((session) => {
            // Parse tags
            let tags: string[] = [];
            if (session.SessionFields) {
              try {
                const parsed = JSON.parse(session.SessionFields);
                if (Array.isArray(parsed)) tags = parsed;
              } catch {
                tags = session.SessionFields.split(",").map((t) => t.trim()).filter(Boolean);
              }
            }

            return (
              <div
                key={session.SessionId}
                className="bg-surface border border-outline/20 rounded-xl overflow-hidden hover:shadow-[0px_4px_16px_rgba(65,36,109,0.08)] hover:border-primary/50 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Card Top */}
                <div className="p-lg flex-1">
                  <div className="flex justify-between items-start mb-md">
                    <span className="bg-secondary-container text-on-secondary-container text-caption font-bold px-sm py-xs rounded-md">
                      {session.SessionYear || "Year —"}
                    </span>
                    <div className="flex items-center gap-xs">
                      <IconButton
                        label="Edit Session"
                        icon={<Pencil className="w-4 h-4 text-on-surface-variant hover:text-primary transition-colors" />}
                        size="sm"
                        onClick={() => handleEdit(session)}
                      />
                      <IconButton
                        label="Delete Session"
                        icon={<Trash2 className="w-4 h-4 text-on-surface-variant hover:text-error transition-colors" />}
                        size="sm"
                        onClick={() => setDeletingSession(session)}
                      />
                    </div>
                  </div>

                  <h3 className="text-h3 font-bold text-on-surface mb-xs group-hover:text-primary transition-colors line-clamp-1">
                    {session.SessionName}
                  </h3>

                  {/* Tags */}
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-xs mb-md">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant text-caption font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="px-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant text-caption">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-small text-on-surface-variant mb-md">
                      General Academic Session
                    </p>
                  )}

                  {/* Meta stats */}
                  <div className="space-y-sm pt-xs border-t border-outline/10">
                    <div className="flex items-center text-small text-on-surface-variant gap-sm">
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="font-medium text-on-surface">
                        {session.StudentCount ?? 0} Students Enrolled
                      </span>
                    </div>
                    <div className="flex items-center text-small text-on-surface-variant gap-sm">
                      <Calendar className="w-4 h-4 text-on-surface-variant" />
                      <span>Added {formatResourceDate(session.AddedDate)}</span>
                    </div>
                    {Boolean(session.CountryCheck) && (
                      <div className="flex items-center text-caption text-secondary font-medium gap-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Geo-verification active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar matching Stitch */}
                <div className="border-t border-outline/10 bg-surface-container-low p-sm flex items-center justify-between gap-xs">
                  <Link
                    href={`/admin/sessions/${session.SessionId}/resources`}
                    className="flex-1 flex items-center justify-center gap-xs text-small font-medium text-primary hover:bg-primary-container/10 py-sm rounded-lg transition-colors"
                  >
                    <Folder className="w-4 h-4" />
                    Resources
                  </Link>

                  <Link
                    href={`/admin/sessions/${session.SessionId}/enrollment`}
                    className="flex-1 flex items-center justify-center gap-xs text-small font-medium text-primary hover:bg-primary-container/10 py-sm rounded-lg transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Enrollments
                  </Link>

                  <Link
                    href={`/admin/case-studies?SessionId=${session.SessionId}`}
                    className="flex-1 flex items-center justify-center gap-xs text-small font-medium text-primary hover:bg-primary-container/10 py-sm rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Cases
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        session={editingSession}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingSession)}
        onClose={() => setDeletingSession(null)}
        onConfirm={() => {
          if (deletingSession) {
            deleteMutation.mutate(deletingSession);
          }
        }}
        title={`Delete Session ${deletingSession?.SessionName || ""}?`}
        message="Are you sure you want to delete this session? All uploaded resources, files, and student enrollments for this session will be permanently removed. This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete Session"}
      />
    </div>
  );
}
