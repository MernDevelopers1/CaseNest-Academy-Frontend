export const ROLES = ["admin", "tutor", "student"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// Only students self-register. Admins are created by other admins, and
// tutors are added by admins too (POST /AddTeacher is an admin action, not
// a public sign-up endpoint) — so /register only has a student route, not
// a role-parameterized one.
