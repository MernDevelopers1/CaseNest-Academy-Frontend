// Shape matches the real Backend response (Backend/src/controllers/
// teacher.controller.js's getAllTeachers) — only the fields the UI
// actually renders are typed here, not every column.

export interface TutorSession {
  SessionName: string | null;
  SessionId: number | null;
  SessionYear: string | null;
}

export interface Tutor {
  Id: number;
  UserId: number;
  Email: string;
  UserName: string | null;
  FirstName: string | null;
  LastName: string | null;
  Education: string | null;
  Specialization: string | null;
  DateofBirth: string | null;
  Gender: string | null;
  Phone: string | null;
  DateofJoining: string | null;
  Address1: string | null;
  Address2: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  CountryName: string | null;
  CountryValue: string | null;
  AddedOn: string | null;
  Active: number | boolean | null;
  DisplayPic: string | null;
  Sessions: TutorSession[];
}

export interface SessionListItem {
  SessionId: number;
  SessionName: string;
  SessionYear: string | null;
}

export function tutorFullName(tutor: Pick<Tutor, "FirstName" | "LastName">): string {
  return [tutor.FirstName, tutor.LastName].filter(Boolean).join(" ") || "—";
}

export function tutorInitials(tutor: Pick<Tutor, "FirstName" | "LastName">): string {
  const first = tutor.FirstName?.charAt(0) ?? "";
  const last = tutor.LastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
}

export function primarySession(tutor: Pick<Tutor, "Sessions">): TutorSession | null {
  return tutor.Sessions.find((session) => session.SessionId) ?? null;
}
