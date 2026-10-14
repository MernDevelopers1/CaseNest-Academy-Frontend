"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  School,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  Hash,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import IconButton from "/src/components/ui/IconButton";
import StatusBadge from "/src/components/ui/StatusBadge";
import { apiFetch } from "/src/lib/api";
import { studentFullName, studentInitials, primarySession } from "/src/lib/studentTypes";
import type { Student } from "/src/lib/studentTypes";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-caption uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className="text-body text-on-surface">{value}</span>
    </div>
  );
}

export default function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const router = useRouter();

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => apiFetch<Student[]>("/AddStudent"),
  });

  const student = studentsQuery.data?.find((s) => String(s.UserId) === id);

  if (studentsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-lg">
        <div className="h-24 w-full animate-pulse rounded-xl bg-surface-container" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-surface-container" />
      </div>
    );
  }

  if (!student) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-md py-2xl text-center">
        <Heading as="h2" size="h3" className="text-on-surface">
          Student not found
        </Heading>
        <Text className="text-on-surface-variant">
          This student may have been removed, or the list hasn&apos;t loaded yet.
        </Text>
        <Link href="/admin/students" className="text-primary hover:underline">
          Back to Manage Students
        </Link>
      </Card>
    );
  }

  const session = primarySession(student);
  const isActive = Boolean(student.Active);

  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <IconButton
            label="Back"
            icon={<ArrowLeft size={20} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/students")}
          />
          <Heading as="h1" size="h3" className="text-on-surface">
            Student Profile Detail
          </Heading>
        </div>
        <Link
          href={`/admin/students/${student.UserId}/edit`}
          className="flex items-center gap-xs rounded-lg bg-surface-container px-lg py-sm text-caption text-primary transition-colors hover:bg-surface-container-high"
        >
          <Pencil size={18} />
          Edit Student
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-xl lg:grid-cols-3">
        {/* Left Column: Identity & Primary Info (Spans 1 col) */}
        <div className="flex flex-col gap-xl">
          {/* Profile Summary Card */}
          <Card padding="lg" className="border-l-4 border-l-secondary">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-lg flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container-highest">
                {student.DisplayPic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${student.DisplayPic}`}
                    alt="Student Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-h1 font-bold text-on-surface-variant">
                    {studentInitials(student)}
                  </span>
                )}
                <span
                  className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface-container-lowest ${
                    isActive ? "bg-success" : "bg-outline"
                  }`}
                />
              </div>

              <Heading as="h2" size="h3" className="mb-xs text-primary">
                {studentFullName(student)}
              </Heading>

              <div className="mb-md">
                <StatusBadge status={isActive ? "Active" : "Inactive"} />
              </div>

              <div className="mt-md w-full border-t border-outline-variant pt-md text-left">
                {student.RollNo && student.RollNo !== "null" && (
                  <div className="mb-md">
                    <p className="mb-xs text-caption uppercase tracking-wider text-on-surface-variant">
                      Roll Number
                    </p>
                    <p className="flex items-center gap-xs text-small font-semibold text-on-surface">
                      <Hash size={16} className="text-secondary" />
                      {student.RollNo}
                    </p>
                  </div>
                )}
                <div className="mb-md">
                  <p className="mb-xs text-caption uppercase tracking-wider text-on-surface-variant">
                    Email
                  </p>
                  <p className="flex items-center gap-xs text-small text-on-surface">
                    <Mail size={16} className="text-on-surface-variant" />
                    {student.Email}
                  </p>
                </div>
                <div className="mb-md">
                  <p className="mb-xs text-caption uppercase tracking-wider text-on-surface-variant">
                    Phone
                  </p>
                  <p className="flex items-center gap-xs text-small text-on-surface">
                    <Phone size={16} className="text-on-surface-variant" />
                    {student.Phone ?? "—"}
                  </p>
                </div>
                {student.UserName && (
                  <div>
                    <p className="mb-xs text-caption uppercase tracking-wider text-on-surface-variant">
                      Username
                    </p>
                    <p className="text-small text-on-surface">@{student.UserName}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Academic Info Card */}
          <Card padding="lg">
            <h3 className="mb-lg flex items-center gap-sm text-h4 text-primary">
              <School size={20} className="text-secondary" />
              Academic Status
            </h3>
            <div className="space-y-md">
              <div>
                <p className="mb-xs text-caption text-on-surface-variant">Enrolled Session</p>
                <p className="text-small font-semibold text-on-surface">
                  {session?.SessionName ? (
                    <span className="rounded-full bg-surface-container px-md py-xs text-small text-on-surface">
                      {session.SessionName}
                      {session.SessionYear ? ` (${session.SessionYear})` : ""}
                    </span>
                  ) : (
                    <span className="text-on-surface-variant">Not assigned</span>
                  )}
                </p>
              </div>
              <div>
                <p className="mb-xs text-caption text-on-surface-variant">Date of Joining</p>
                <p className="flex items-center gap-xs text-small text-on-surface">
                  <Calendar size={16} className="text-primary" />
                  {formatDate(student.DateofJoining ?? student.AddedOn)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Personal & Demographic Info (Spans 2 cols) */}
        <div className="flex flex-col gap-xl lg:col-span-2">
          {/* Personal Information */}
          <Card padding="lg">
            <h3 className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-md text-h4 text-primary">
              <IdCard size={20} className="text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
              <DetailField label="First Name" value={student.FirstName ?? "—"} />
              <DetailField label="Last Name" value={student.LastName ?? "—"} />
              <DetailField label="Date of Birth" value={formatDate(student.DateofBirth)} />
              <DetailField label="Gender" value={student.Gender ?? "—"} />
            </div>
          </Card>

          {/* Location Details */}
          <Card padding="lg">
            <h3 className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-md text-h4 text-primary">
              <MapPin size={20} className="text-tertiary-fixed-dim" />
              Location Details
            </h3>
            <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
              <div className="sm:col-span-2">
                <DetailField label="Address Line 1" value={student.Address1 ?? "—"} />
              </div>
              {student.Address2 && student.Address2 !== "null" && (
                <div className="sm:col-span-2">
                  <DetailField label="Address Line 2" value={student.Address2} />
                </div>
              )}
              <DetailField label="City" value={student.City ?? "—"} />
              <DetailField label="State / Province" value={student.State ?? "—"} />
              <DetailField label="Zip / Postal Code" value={student.ZipCode ?? "—"} />
              <DetailField label="Country" value={student.CountryName ?? student.CountryValue ?? "—"} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
