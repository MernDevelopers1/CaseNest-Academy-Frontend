"use client";

import ChangePasswordView from "/src/components/profile/ChangePasswordView";

export default function AdminChangePasswordPage() {
  return (
    <ChangePasswordView
      role="admin"
      backHref="/admin/profile"
    />
  );
}
