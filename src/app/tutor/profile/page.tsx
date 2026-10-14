"use client";

import ProfileView from "/src/components/profile/ProfileView";

export default function TutorProfilePage() {
  return (
    <ProfileView
      role="tutor"
      changePasswordHref="/tutor/change-password"
    />
  );
}
