"use client";

import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import TutorForm from "/src/components/admin/tutors/TutorForm";

export default function NewTutorPage() {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <Heading as="h1" size="display" className="text-on-surface">
          Add New Tutor
        </Heading>
        <Text className="mt-xs text-on-surface-variant">
          Fill in the details to register a new educator to the platform.
        </Text>
      </div>
      <TutorForm mode="create" />
    </div>
  );
}
