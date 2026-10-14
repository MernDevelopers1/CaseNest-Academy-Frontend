"use client";

import ChangePasswordView from "/src/components/profile/ChangePasswordView";

export default function StudentChangePasswordPage() {
  return (
    <ChangePasswordView
      role="student"
      backHref="/student/profile"
    />
  );
}
