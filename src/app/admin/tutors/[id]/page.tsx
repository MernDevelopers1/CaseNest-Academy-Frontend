"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  ContactRound,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import IconButton from "/src/components/ui/IconButton";
import { apiFetch } from "/src/lib/api";
import { tutorFullName, tutorInitials } from "/src/lib/tutorTypes";
import type { Tutor } from "/src/lib/tutorTypes";

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

export default function TutorDetailPage(props: PageProps<"/admin/tutors/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();

  // Reuses the same list query/cache rather than a dedicated single-tutor
  // endpoint — see the Manage Tutors RUN prompt's INVESTIGATE FIRST point 5:
  // no such endpoint exists yet on the Backend.
  const tutorsQuery = useQuery({
    queryKey: ["tutors"],
    queryFn: () => apiFetch<Tutor[]>("/AddTeacher"),
  });

  const tutor = tutorsQuery.data?.find((t) => String(t.UserId) === id);

  if (tutorsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-lg">
        <div className="h-24 w-full animate-pulse rounded-xl bg-surface-container" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-surface-container" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-md py-2xl text-center">
        <Heading as="h2" size="h3" className="text-on-surface">
          Tutor not found
        </Heading>
        <Text className="text-on-surface-variant">
          This tutor may have been removed, or the list hasn&apos;t loaded yet.
        </Text>
        <Link href="/admin/tutors" className="text-primary hover:underline">
          Back to Manage Tutors
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <IconButton
            label="Back"
            icon={<ArrowLeft size={20} />}
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/tutors")}
          />
          <Heading as="h1" size="h3" className="text-on-surface">
            Tutor Profile
          </Heading>
        </div>
        <Link
          href={`/admin/tutors/${tutor.UserId}/edit`}
          className="flex items-center gap-xs rounded-lg bg-surface-container px-lg py-sm text-caption text-primary transition-colors hover:bg-surface-container-high"
        >
          <Pencil size={18} />
          Edit Profile
        </Link>
      </div>

      {/* Identity Card */}
      <Card padding="lg" className="relative flex flex-col items-start gap-xl overflow-hidden md:flex-row">
        <div className="absolute inset-y-0 left-0 w-xs bg-primary" />
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest">
          {tutor.DisplayPic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${tutor.DisplayPic}`}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-h2 font-bold text-on-surface-variant">
              {tutorInitials(tutor)}
            </span>
          )}
          <span
            className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface-container-lowest ${
              tutor.Active ? "bg-success" : "bg-outline"
            }`}
          />
        </div>
        <div className="flex flex-1 flex-col gap-sm pt-sm">
          <div>
            <Heading as="h2" size="h2" className="text-on-surface">
              {tutorFullName(tutor)}
            </Heading>
            {tutor.UserName && (
              <Text className="text-on-surface-variant">@{tutor.UserName}</Text>
            )}
          </div>
          <div className="mt-xs flex flex-wrap gap-sm">
            {tutor.Specialization && (
              <span className="inline-flex items-center gap-xs rounded-full bg-secondary-container px-md py-xs text-caption text-on-secondary-container">
                <GraduationCap size={16} />
                {tutor.Specialization}
              </span>
            )}
            {tutor.Education && (
              <span className="inline-flex items-center gap-xs rounded-full bg-surface-container-high px-md py-xs text-caption text-on-surface-variant">
                <BadgeCheck size={16} />
                {tutor.Education}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
        <Card padding="lg" className="md:col-span-2 lg:col-span-2">
          <h3 className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-sm text-h4 text-on-surface">
            <IdCard size={20} className="text-primary" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-x-xl gap-y-lg sm:grid-cols-2">
            <DetailField label="First Name" value={tutor.FirstName ?? "—"} />
            <DetailField label="Last Name" value={tutor.LastName ?? "—"} />
            <DetailField label="Date of Birth" value={formatDate(tutor.DateofBirth)} />
            <DetailField label="Gender" value={tutor.Gender ?? "—"} />
            <div className="flex flex-col gap-xs sm:col-span-2">
              <span className="text-caption uppercase tracking-wider text-on-surface-variant">
                Date of Joining
              </span>
              <span className="flex items-center gap-xs text-body text-on-surface">
                <Calendar size={18} className="text-primary" />
                {formatDate(tutor.DateofJoining)}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col gap-lg lg:col-span-1">
          <h3 className="flex items-center gap-sm border-b border-outline-variant pb-sm text-h4 text-on-surface">
            <ContactRound size={20} className="text-secondary" />
            Contact Details
          </h3>
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <span className="text-caption uppercase tracking-wider text-on-surface-variant">
                Email Address
              </span>
              <div className="flex items-center gap-sm rounded-lg bg-surface-container p-md">
                <Mail size={20} className="text-on-surface-variant" />
                <span className="break-all text-body text-on-surface">{tutor.Email}</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="text-caption uppercase tracking-wider text-on-surface-variant">
                Phone Number
              </span>
              <div className="flex items-center gap-sm rounded-lg bg-surface-container p-md">
                <Phone size={20} className="text-on-surface-variant" />
                <span className="text-body text-on-surface">{tutor.Phone ?? "—"}</span>
              </div>
            </div>
          </div>

          <h3 className="flex items-center gap-sm border-b border-outline-variant pb-sm text-h4 text-on-surface">
            <MapPin size={20} className="text-tertiary-fixed-dim" />
            Location
          </h3>
          <div className="flex flex-col gap-md">
            <DetailField label="Address" value={tutor.Address1 ?? "—"} />
            <div className="grid grid-cols-2 gap-md">
              <DetailField label="City" value={tutor.City ?? "—"} />
              <DetailField label="Zip Code" value={tutor.ZipCode ?? "—"} />
            </div>
            <DetailField label="Country" value={tutor.CountryName ?? "—"} />
          </div>
        </Card>
      </div>
    </div>
  );
}
