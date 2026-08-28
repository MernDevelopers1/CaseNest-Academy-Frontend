import type { AuthUser } from "/src/components/AuthProvider";

// AuthUser's fields beyond `role` are untyped (Record<string, unknown>) —
// they're whatever a login/signup endpoint happened to return — so every
// access here is guarded rather than assumed.
export function getUserDisplayName(user: AuthUser | null): string | null {
  if (!user) return null;
  const firstName = typeof user.FirstName === "string" ? user.FirstName : "";
  const lastName = typeof user.LastName === "string" ? user.LastName : "";
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  return typeof user.Email === "string" ? user.Email : null;
}
