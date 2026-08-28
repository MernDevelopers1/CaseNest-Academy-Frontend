export const ROLES = ["admin", "tutor", "student"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// Admins are created by other admins, not self-registered — no admin
// sign-up route exists.
export const SIGNUP_ROLES = ["tutor", "student"] as const;

export type SignupRole = (typeof SIGNUP_ROLES)[number];

export function isSignupRole(value: string): value is SignupRole {
  return (SIGNUP_ROLES as readonly string[]).includes(value);
}
