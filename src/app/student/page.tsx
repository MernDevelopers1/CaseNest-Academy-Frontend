"use client";

import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";
import ComingSoon from "/src/components/shell/ComingSoon";
import Heading from "/src/components/ui/Heading";

export default function StudentDashboardPage() {
  const { user } = useAuthContext();
  const name = getUserDisplayName(user);

  return (
    <div className="flex flex-col gap-lg">
      <Heading as="h1" size="h2" className="text-on-surface">
        Welcome{name ? `, ${name}` : ""}
      </Heading>
      <ComingSoon phase="Phase 6" />
    </div>
  );
}
