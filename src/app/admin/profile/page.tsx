"use client";

import ProfileView from "/src/components/profile/ProfileView";

export default function AdminProfilePage() {
  return (
    <ProfileView
      role="admin"
      changePasswordHref="/admin/change-password"
    />
  );
}
