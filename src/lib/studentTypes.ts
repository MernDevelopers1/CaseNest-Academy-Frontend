// Shape matches the real Backend response (Backend/src/controllers/
// student.controller.js's getAllstudents) — only the fields the UI
// actually renders are typed here.

export interface StudentSession {
  SessionName: string | null;
  SessionId: number | null;
  SessionYear: string | null;
}

export interface Student {
  Id: number;
  UserId: number;
  Email: string;
  UserName: string | null;
  FirstName: string | null;
  LastName: string | null;
  RollNo: string | null;
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
  Sessions: StudentSession[];
}

export function studentFullName(student: Pick<Student, "FirstName" | "LastName">): string {
  return [student.FirstName, student.LastName].filter(Boolean).join(" ") || "—";
}

export function studentInitials(student: Pick<Student, "FirstName" | "LastName">): string {
  const first = student.FirstName?.charAt(0) ?? "";
  const last = student.LastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
}

export function primarySession(student: Pick<Student, "Sessions">): StudentSession | null {
  return student.Sessions.find((session) => session.SessionId) ?? null;
}
