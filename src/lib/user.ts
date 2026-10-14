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

export function getUserId(user: AuthUser | null): number | null {
  if (!user) return null;
  const id = user.id ?? user.UserId ?? user.Id;
  const num = Number(id);
  return isNaN(num) || num <= 0 ? null : num;
}

export function getUserSessionId(user: AuthUser | null): number | null {
  if (!user) return null;
  const sid = user.SessionId;
  const num = Number(sid);
  return isNaN(num) || num <= 0 ? null : num;
}

export function getUserSessionName(user: AuthUser | null): string | null {
  if (!user) return null;
  if (typeof user.SessionName === "string" && user.SessionName) return user.SessionName;
  if (typeof user.Session_Code === "string" && user.Session_Code) return user.Session_Code;
  return null;
}

export function getUserDisplayPic(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  if (typeof user.DisplayPic === "string" && user.DisplayPic) return user.DisplayPic;
  return undefined;
}
