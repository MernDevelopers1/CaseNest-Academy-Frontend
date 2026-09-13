"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import { apiFetch } from "/src/lib/api";
import type { Tutor } from "/src/lib/tutorTypes";
import TutorForm from "/src/components/admin/tutors/TutorForm";

export default function EditTutorPage(props: PageProps<"/admin/tutors/[id]/edit">) {
  const { id } = use(props.params);

  // Same reused list query as the detail page — see INVESTIGATE FIRST point
  // 5 in the Manage Tutors RUN prompt (no dedicated single-tutor endpoint).
  const tutorsQuery = useQuery({
    queryKey: ["tutors"],
    queryFn: () => apiFetch<Tutor[]>("/AddTeacher"),
  });

  const tutor = tutorsQuery.data?.find((t) => String(t.UserId) === id);

  if (tutorsQuery.isLoading) {
    return <div className="h-96 w-full animate-pulse rounded-xl bg-surface-container" />;
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
    <div className="flex flex-col gap-lg">
      <div>
        <Heading as="h1" size="display" className="text-on-surface">
          Edit Tutor
        </Heading>
        <Text className="mt-xs text-on-surface-variant">
          Update {tutor.FirstName ?? "this tutor"}&apos;s details.
        </Text>
      </div>
      <TutorForm mode="edit" initialValues={tutor} />
    </div>
  );
}
