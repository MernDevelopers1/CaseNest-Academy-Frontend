"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";
import IconButton from "/src/components/ui/IconButton";
import Table from "/src/components/ui/Table";
import type { TableColumn } from "/src/components/ui/Table";
import StatusBadge from "/src/components/ui/StatusBadge";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { studentFullName, studentInitials, primarySession } from "/src/lib/studentTypes";
import type { Student } from "/src/lib/studentTypes";

const PAGE_SIZE = 10;

function formatJoinedDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `Joined ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

export default function ManageStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => apiFetch<Student[]>("/AddStudent"),
  });

  const deleteMutation = useMutation({
    mutationFn: (student: Student) =>
      apiFetch<string>(`/AddStudent?UserId=${student.UserId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      showToast({ variant: "success", message: "Student deleted successfully" });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Couldn't delete this student. Please try again.",
      });
    },
  });

  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);

  // KPI Calculations
  const totalActive = useMemo(
    () => students.filter((s) => Boolean(s.Active)).length,
    [students],
  );

  const inSessions = useMemo(
    () => students.filter((s) => Boolean(primarySession(s))).length,
    [students],
  );

  const needsAttention = useMemo(
    () => students.filter((s) => !primarySession(s)).length,
    [students],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const term = search.trim().toLowerCase();
    return students.filter((student) =>
      `${studentFullName(student)} ${student.Email} ${student.RollNo ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: TableColumn<Student>[] = [
    {
      key: "FirstName",
      label: "Student Name",
      render: (student) => (
        <div className="flex items-center gap-md">
          {student.DisplayPic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${student.DisplayPic}`}
              alt=""
              className="h-10 w-10 rounded-full border border-outline-variant object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-h4 font-bold text-on-secondary-fixed">
              {studentInitials(student)}
            </div>
          )}
          <div>
            <div className="text-h4 text-on-surface">{studentFullName(student)}</div>
            <div className="text-caption text-on-surface-variant">
              {student.RollNo && student.RollNo !== "null"
                ? `Roll No: ${student.RollNo} • `
                : ""}
              {formatJoinedDate(student.DateofJoining ?? student.AddedOn)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "Sessions",
      label: "Enrolled Session",
      render: (student) => {
        const first = primarySession(student);
        const extra = student.Sessions.filter((s) => s.SessionId).length - (first ? 1 : 0);
        if (!first) {
          return <span className="text-small text-on-surface-variant">Not assigned</span>;
        }
        return (
          <span className="inline-flex items-center gap-xs">
            <span className="rounded-full bg-surface-container px-md py-xs text-small text-on-surface">
              {first.SessionName}
            </span>
            {extra > 0 && (
              <span className="text-caption text-on-surface-variant">+{extra} more</span>
            )}
          </span>
        );
      },
    },
    {
      key: "Active",
      label: "Status",
      render: (student) => (
        <StatusBadge
          status={student.Active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "Id",
      label: "Actions",
      render: (student) => (
        <div className="flex justify-end gap-xs transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <IconButton
            label="View"
            icon={<Eye size={18} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/students/${student.UserId}`)}
          />
          <IconButton
            label="Edit"
            icon={<Pencil size={18} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/students/${student.UserId}/edit`)}
          />
          <IconButton
            label="Delete"
            icon={<Trash2 size={18} />}
            variant="secondary"
            size="sm"
            className="hover:bg-error-container hover:text-error"
            onClick={() => setDeleteTarget(student)}
          />
        </div>
      ),
    },
  ];

  const showEmptyState = !studentsQuery.isLoading && filtered.length === 0;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col items-start justify-between gap-md md:flex-row md:items-center">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Manage Students
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            Overview and administration of enrolled learners across sessions.
          </Text>
        </div>
        <Link href="/admin/students/new">
          <Button className="flex items-center gap-xs">
            <Plus size={18} />
            Add New Student
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <Card className="flex items-center gap-lg border-l-4 border-l-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Users size={24} />
          </div>
          <div>
            <div className="text-caption font-bold uppercase tracking-wider text-on-surface-variant">
              Total Active
            </div>
            <div className="text-h2 font-black text-on-surface">{totalActive}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-lg border-l-4 border-l-secondary">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed">
            <CalendarCheck size={24} />
          </div>
          <div>
            <div className="text-caption font-bold uppercase tracking-wider text-on-surface-variant">
              In Sessions
            </div>
            <div className="text-h2 font-black text-on-surface">{inSessions}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-lg border-l-4 border-l-error">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-on-error-container">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-caption font-bold uppercase tracking-wider text-on-surface-variant">
              Needs Attention
            </div>
            <div className="text-h2 font-black text-on-surface">{needsAttention}</div>
          </div>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col items-center justify-between gap-md border-b border-outline-variant bg-surface-container-lowest p-lg sm:flex-row">
          <div className="relative w-full sm:w-96">
            <Search
              size={18}
              className="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search students..."
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface pl-3xl pr-md text-body text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={() => showToast({ variant: "info", message: "Filtering isn't available yet" })}
            className="flex w-full items-center justify-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-small text-on-surface-variant transition-colors hover:bg-surface-variant sm:w-auto"
          >
            <Filter size={18} />
            Filter
          </button>
        </div>

        {showEmptyState ? (
          <div className="flex flex-col items-center gap-md p-4xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-outline">
              <GraduationCap size={32} />
            </div>
            <Heading as="h3" size="h3" className="text-on-surface">
              No Students Found
            </Heading>
            <Text className="max-w-md text-on-surface-variant">
              {search
                ? "No students match your search."
                : "It looks like there are no students registered yet. Add a new student to get started."}
            </Text>
            <Link href="/admin/students/new">
              <Button variant="secondary">Add Student</Button>
            </Link>
          </div>
        ) : (
          <Table columns={columns} rows={paged} loading={studentsQuery.isLoading} />
        )}

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-md">
          <Text size="caption" className="text-on-surface-variant">
            {filtered.length === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${filtered.length} entries`}
          </Text>
          <div className="flex gap-xs">
            <IconButton
              label="Previous page"
              icon={<ChevronLeft size={18} />}
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <IconButton
              label="Next page"
              icon={<ChevronRight size={18} />}
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Student Data"
        message="Are you sure you want to delete this student's data? This action cannot be undone and will remove them from all enrolled sessions, case studies, and feedback."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
