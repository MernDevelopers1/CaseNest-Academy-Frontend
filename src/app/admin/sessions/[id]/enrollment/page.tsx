"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Search,
  CheckCircle,
  Circle,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import type { Session, SessionStudent } from "/src/lib/sessionTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

type FilterTab = "all" | "enrolled" | "available";

export default function SessionEnrollmentPage({ params }: PageProps) {
  const { id: sessionId } = use(params);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [unenrollingStudent, setUnenrollingStudent] = useState<SessionStudent | null>(null);

  // 1. Fetch Session Info
  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const data = await apiFetch<Session[]>(`/AddSession?SessionId=${sessionId}`);
      return data?.[0] ?? null;
    },
  });

  // 2. Fetch Enrolled Students for this Session
  const enrolledQuery = useQuery({
    queryKey: ["enrolledStudents", sessionId],
    queryFn: () =>
      apiFetch<SessionStudent[]>(`/enrolledlist?SessionId=${sessionId}`),
  });

  // 3. Fetch Available (Unassigned) Students
  const availableQuery = useQuery({
    queryKey: ["availableStudents", sessionId],
    queryFn: () => apiFetch<SessionStudent[]>("/enrollstudent"),
  });

  const session = sessionQuery.data;
  const enrolledStudents = useMemo(() => enrolledQuery.data ?? [], [enrolledQuery.data]);
  const availableStudents = useMemo(() => availableQuery.data ?? [], [availableQuery.data]);

  // Combine lists with isEnrolled flag
  const allStudents = useMemo(() => {
    const list: SessionStudent[] = [];
    const enrolledIds = new Set<number>();

    enrolledStudents.forEach((st) => {
      enrolledIds.add(st.UserId);
      list.push({ ...st, isEnrolled: true });
    });

    availableStudents.forEach((st) => {
      if (!enrolledIds.has(st.UserId)) {
        list.push({ ...st, isEnrolled: false });
      }
    });

    return list;
  }, [enrolledStudents, availableStudents]);

  // Filtered list based on Search & Active Tab
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      // Tab filter
      if (activeTab === "enrolled" && !st.isEnrolled) return false;
      if (activeTab === "available" && st.isEnrolled) return false;

      // Search filter
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const fullName = `${st.FirstName || ""} ${st.LastName || ""}`.toLowerCase();
      const email = (st.Email || "").toLowerCase();
      const rollNo = (st.RollNo || "").toLowerCase();
      const spec = (st.Specialization || "").toLowerCase();

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        rollNo.includes(term) ||
        spec.includes(term)
      );
    });
  }, [allStudents, activeTab, search]);

  // Mutation: Enroll Student
  const enrollMutation = useMutation({
    mutationFn: (student: SessionStudent) =>
      apiFetch<SessionStudent[]>("/enrollstudent", {
        method: "POST",
        body: JSON.stringify({
          StudentId: student.UserId,
          SessionId: Number(sessionId),
        }),
      }),
    onSuccess: (_, student) => {
      queryClient.invalidateQueries({ queryKey: ["enrolledStudents", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["availableStudents", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showToast({
        variant: "success",
        message: `${student.FirstName || "Student"} enrolled into session.`,
      });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to enroll student. Please try again.",
      });
    },
  });

  // Mutation: Unenroll Student
  const unenrollMutation = useMutation({
    mutationFn: (student: SessionStudent) =>
      apiFetch<{ message?: string }>(`/enrollstudent?StudentId=${student.UserId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, student) => {
      queryClient.invalidateQueries({ queryKey: ["enrolledStudents", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["availableStudents", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showToast({
        variant: "success",
        message: `${student.FirstName || "Student"} unenrolled from session.`,
      });
      setUnenrollingStudent(null);
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to unenroll student. Please try again.",
      });
      setUnenrollingStudent(null);
    },
  });

  const getStudentInitials = (st: SessionStudent) => {
    const first = st.FirstName?.charAt(0) || "";
    const last = st.LastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "ST";
  };

  const isLoading = enrolledQuery.isLoading || availableQuery.isLoading;

  return (
    <div className="space-y-xl max-w-5xl mx-auto">
      {/* Header / Breadcrumbs & Summary Pill matching Stitch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline/10 pb-lg">
        <div>
          <nav className="flex items-center text-on-surface-variant text-small mb-xs gap-xs">
            <Link
              href="/admin/sessions"
              className="hover:text-primary transition-colors flex items-center gap-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sessions</span>
            </Link>
            <span className="text-outline">/</span>
            <span className="text-on-surface-variant font-medium">
              {session?.SessionName || "Session"}
            </span>
            <span className="text-outline">/</span>
            <span className="font-semibold text-on-surface">Manage Enrolments</span>
          </nav>
          <h1 className="text-h1-mobile md:text-h1 font-bold text-primary">
            Manage Enrolments
          </h1>
        </div>

        {/* Summary Pill Badge matching Stitch */}
        <div className="flex items-center gap-sm bg-secondary-fixed text-on-secondary-fixed px-md py-sm rounded-full w-fit shadow-xs">
          <Users className="w-4 h-4 text-on-secondary-fixed" />
          <span className="text-h4 font-bold">
            {enrolledStudents.length} Students Enrolled
          </span>
        </div>
      </div>

      {/* Tools Panel: Search & Filter Tabs matching Stitch */}
      <Card className="p-md md:p-lg flex flex-col md:flex-row gap-md items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-11 pr-md py-sm bg-surface-container-low border border-outline/20 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
        </div>

        {/* Filter Tabs matching Stitch */}
        <div className="flex items-center gap-xs w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-md py-sm rounded-full text-small font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface text-on-surface border border-outline/20 hover:bg-surface-container"
            }`}
          >
            All Students ({allStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("enrolled")}
            className={`px-md py-sm rounded-full text-small font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "enrolled"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface text-on-surface border border-outline/20 hover:bg-surface-container"
            }`}
          >
            Enrolled ({enrolledStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`px-md py-sm rounded-full text-small font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "available"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface text-on-surface border border-outline/20 hover:bg-surface-container"
            }`}
          >
            Available ({availableStudents.length})
          </button>
        </div>
      </Card>

      {/* Students List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface border border-outline/20 rounded-xl p-md flex items-center justify-between gap-sm animate-pulse"
            >
              <div className="flex items-center gap-md w-full">
                <div className="w-12 h-12 rounded-full bg-surface-container shrink-0" />
                <div className="space-y-sm w-full">
                  <div className="h-4 w-1/2 bg-surface-container rounded" />
                  <div className="h-3 w-1/3 bg-surface-container rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4xl text-center bg-surface border border-dashed border-outline/20 rounded-2xl p-xl">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-md text-on-surface-variant">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-h3 font-bold text-primary mb-xs">No students found</h3>
          <p className="text-body text-on-surface-variant max-w-sm mb-lg">
            We couldn&apos;t find any students matching your search criteria. Try adjusting your search term or filters.
          </p>
          {(search || activeTab !== "all") && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setActiveTab("all");
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {filteredStudents.map((student) => {
            const fullName = [student.FirstName, student.LastName].filter(Boolean).join(" ") || "Student";
            const initials = getStudentInitials(student);

            if (student.isEnrolled) {
              /* Enrolled Student Card matching Stitch */
              return (
                <div
                  key={student.UserId}
                  className="bg-primary-fixed/20 border border-primary-fixed-dim rounded-xl p-md flex items-center justify-between gap-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-md min-w-0">
                    <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden border border-outline/20 shrink-0 relative">
                      {student.DisplayPic ? (
                        <img
                          src={
                            student.DisplayPic.startsWith("http")
                              ? student.DisplayPic
                              : `${process.env.NEXT_PUBLIC_API_URL}${student.DisplayPic}`
                          }
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-small">
                          {initials}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-h4 font-bold text-primary truncate">
                        {fullName}
                      </span>
                      <span className="text-small text-on-surface-variant truncate">
                        ID: {student.RollNo || `ST-${student.UserId}`} • {student.Specialization || student.Education || "Student"}
                      </span>
                      <div className="flex items-center gap-xs mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-caption font-bold text-secondary">
                          ENROLLED
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUnenrollingStudent(student)}
                    className="flex items-center justify-center p-sm rounded-lg border border-outline/30 text-error hover:bg-error-container hover:text-on-error-container hover:border-error-container transition-colors cursor-pointer shrink-0"
                    title="Unenrol Student"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                </div>
              );
            }

            /* Available Student Card matching Stitch */
            return (
              <div
                key={student.UserId}
                className="bg-surface border border-outline/20 rounded-xl p-md flex items-center justify-between gap-sm transition-all hover:shadow-md hover:border-primary-fixed-dim"
              >
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden border border-outline/20 shrink-0">
                    {student.DisplayPic ? (
                      <img
                        src={
                          student.DisplayPic.startsWith("http")
                            ? student.DisplayPic
                            : `${process.env.NEXT_PUBLIC_API_URL}${student.DisplayPic}`
                        }
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-small">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-h4 font-semibold text-on-surface truncate">
                      {fullName}
                    </span>
                    <span className="text-small text-on-surface-variant truncate">
                      ID: {student.RollNo || `ST-${student.UserId}`} • {student.Specialization || student.Education || "Student"}
                    </span>
                    <div className="flex items-center gap-xs mt-0.5 opacity-70">
                      <Circle className="w-2.5 h-2.5 text-on-surface-variant" />
                      <span className="text-caption font-medium text-on-surface-variant">
                        AVAILABLE
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => enrollMutation.mutate(student)}
                  disabled={enrollMutation.isPending}
                  className="flex items-center gap-xs shrink-0 whitespace-nowrap"
                >
                  {enrollMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Enrol
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Unenrol Confirmation Dialog matching Stitch */}
      <ConfirmDialog
        open={Boolean(unenrollingStudent)}
        onClose={() => setUnenrollingStudent(null)}
        onConfirm={() => {
          if (unenrollingStudent) {
            unenrollMutation.mutate(unenrollingStudent);
          }
        }}
        title={`Unenrol ${[unenrollingStudent?.FirstName, unenrollingStudent?.LastName].filter(Boolean).join(" ") || "Student"}?`}
        message="They will lose access to all session resources immediately. This action can be undone by re-enrolling them later."
        confirmLabel={unenrollMutation.isPending ? "Unenrolling..." : "Unenrol Student"}
      />
    </div>
  );
}
