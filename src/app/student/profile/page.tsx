"use client";

import ProfileView from "/src/components/profile/ProfileView";

export default function StudentProfilePage() {
  return (
    <ProfileView
      role="student"
      changePasswordHref="/student/change-password"
    />
  );
}
