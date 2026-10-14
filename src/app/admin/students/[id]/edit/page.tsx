"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import { apiFetch } from "/src/lib/api";
import type { Student } from "/src/lib/studentTypes";
import StudentForm from "/src/components/admin/students/StudentForm";

export default function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => apiFetch<Student[]>("/AddStudent"),
  });

  const student = studentsQuery.data?.find((s) => String(s.UserId) === id);

  if (studentsQuery.isLoading) {
    return <div className="h-96 w-full animate-pulse rounded-xl bg-surface-container" />;
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

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <Heading as="h1" size="display" className="text-on-surface">
          Edit Student
        </Heading>
        <Text className="mt-xs text-on-surface-variant">
          Update {student.FirstName ?? "this student"}&apos;s details.
        </Text>
      </div>
      <StudentForm mode="edit" initialValues={student} />
    </div>
  );
}
