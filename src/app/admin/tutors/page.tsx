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
  UsersRound,
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
import { tutorFullName, tutorInitials, primarySession } from "/src/lib/tutorTypes";
import type { Tutor } from "/src/lib/tutorTypes";

const PAGE_SIZE = 10;

function formatJoinedDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `Joined ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

export default function ManageTutorsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Tutor | null>(null);

  const tutorsQuery = useQuery({
    queryKey: ["tutors"],
    queryFn: () => apiFetch<Tutor[]>("/AddTeacher"),
  });

  const deleteMutation = useMutation({
    mutationFn: (tutor: Tutor) =>
      apiFetch<string>(`/AddTeacher?UserId=${tutor.UserId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      showToast({ variant: "success", message: "Tutor deleted successfully" });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Couldn't delete this tutor. Please try again.",
      });
    },
  });

  const filtered = useMemo(() => {
    const rows = tutorsQuery.data ?? [];
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((tutor) =>
      `${tutorFullName(tutor)} ${tutor.Email}`.toLowerCase().includes(term),
    );
  }, [tutorsQuery.data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: TableColumn<Tutor>[] = [
    {
      key: "FirstName",
      label: "Tutor Name",
      render: (tutor) => (
        <div className="flex items-center gap-md">
          {tutor.DisplayPic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${tutor.DisplayPic}`}
              alt=""
              className="h-10 w-10 rounded-full border border-outline-variant object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-h4 font-bold text-on-secondary-container">
              {tutorInitials(tutor)}
            </div>
          )}
          <div>
            <div className="text-h4 text-on-surface">{tutorFullName(tutor)}</div>
            <div className="text-caption text-on-surface-variant">
              {formatJoinedDate(tutor.DateofJoining)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "Sessions",
      label: "Assigned Session",
      render: (tutor) => {
        const first = primarySession(tutor);
        const extra = tutor.Sessions.filter((s) => s.SessionId).length - (first ? 1 : 0);
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
      render: (tutor) => <StatusBadge status={tutor.Active ? "Active" : "Inactive"} />,
    },
    {
      key: "Id",
      label: "Actions",
      render: (tutor) => (
        <div className="flex justify-end gap-xs transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <IconButton
            label="View"
            icon={<Eye size={18} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/tutors/${tutor.UserId}`)}
          />
          <IconButton
            label="Edit"
            icon={<Pencil size={18} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/tutors/${tutor.UserId}/edit`)}
          />
          <IconButton
            label="Delete"
            icon={<Trash2 size={18} />}
            variant="secondary"
            size="sm"
            className="hover:bg-error-container hover:text-error"
            onClick={() => setDeleteTarget(tutor)}
          />
        </div>
      ),
    },
  ];

  const showEmptyState = !tutorsQuery.isLoading && filtered.length === 0;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col items-start justify-between gap-md md:flex-row md:items-center">
        <div>
          <Heading as="h1" size="h1" className="text-primary">
            Manage Tutors
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            View and manage assigned tutors across sessions.
          </Text>
        </div>
        <Link href="/admin/tutors/new">
          <Button className="flex items-center gap-xs">
            <Plus size={18} />
            Add New Tutor
          </Button>
        </Link>
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
              placeholder="Search tutors..."
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
              <UsersRound size={32} />
            </div>
            <Heading as="h3" size="h3" className="text-on-surface">
              No Tutors Found
            </Heading>
            <Text className="max-w-md text-on-surface-variant">
              {search
                ? "No tutors match your search."
                : "It looks like there are no tutors assigned yet. Add a new tutor to get started."}
            </Text>
            <Link href="/admin/tutors/new">
              <Button variant="secondary">Add Tutor</Button>
            </Link>
          </div>
        ) : (
          <Table columns={columns} rows={paged} loading={tutorsQuery.isLoading} />
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
        title="Delete Tutor Data"
        message="Are you sure you want to delete this tutor's data? This action cannot be undone and will remove them from all assigned sessions."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
