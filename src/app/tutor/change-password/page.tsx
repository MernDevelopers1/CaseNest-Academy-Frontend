"use client";

import ChangePasswordView from "/src/components/profile/ChangePasswordView";

export default function TutorChangePasswordPage() {
  return (
    <ChangePasswordView
      role="tutor"
      backHref="/tutor/profile"
    />
  );
}
