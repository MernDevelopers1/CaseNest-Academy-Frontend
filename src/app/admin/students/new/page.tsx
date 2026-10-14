"use client";

import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import StudentForm from "/src/components/admin/students/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <Heading as="h1" size="display" className="text-on-surface">
          Add New Student
        </Heading>
        <Text className="mt-xs text-on-surface-variant">
          Fill in the details to create a new student record in the portal.
        </Text>
      </div>
      <StudentForm mode="create" />
    </div>
  );
}
