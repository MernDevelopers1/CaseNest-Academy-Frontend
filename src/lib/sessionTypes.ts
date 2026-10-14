// TypeScript definitions and helper utilities for Sessions, Resources, and Enrollments.

export interface Session {
  SessionId: number;
  SessionName: string;
  SessionYear: string;
  SessionFields?: string | null;
  CountryCheck?: number | boolean | null;
  AddedDate?: string | null;
  StudentCount?: number;
}

export interface SessionResource {
  ResourceId: number;
  SessionId: number;
  FileTitle: string;
  FileName: string;
  Path: string;
  AddedOn: string;
}

export interface SessionStudent {
  UserId: number;
  StudentId?: number;
  EnrollId?: number;
  EnrollOn?: string;
  FirstName: string | null;
  LastName: string | null;
  Email: string;
  RollNo?: string | null;
  Education?: string | null;
  Specialization?: string | null;
  DisplayPic?: string | null;
  isEnrolled?: boolean;
}

export function formatResourceDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

export function getFileExtension(filename: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
}

export function getFileIconName(filename: string): string {
  const ext = getFileExtension(filename);
  switch (ext) {
    case "pdf":
      return "picture_as_pdf";
    case "doc":
    case "docx":
      return "description";
    case "ppt":
    case "pptx":
      return "present_to_all";
    case "xls":
    case "xlsx":
      return "table_chart";
    default:
      return "draft";
  }
}

export function getFileIconBadgeStyle(filename: string): { bg: string; text: string } {
  const ext = getFileExtension(filename);
  switch (ext) {
    case "pdf":
      return { bg: "bg-error-container", text: "text-on-error-container" };
    case "doc":
    case "docx":
      return { bg: "bg-secondary-fixed-dim", text: "text-on-secondary-fixed-variant" };
    case "ppt":
    case "pptx":
      return { bg: "bg-tertiary-fixed-dim", text: "text-on-tertiary-fixed-variant" };
    case "xls":
    case "xlsx":
      return { bg: "bg-secondary-container/50", text: "text-on-secondary-container" };
    default:
      return { bg: "bg-surface-container-high", text: "text-on-surface-variant" };
  }
}

export function getResourceFileUrl(filePath: string): string {
  if (!filePath) return "#";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const clean = filePath.replace(/\\/g, "/").replace(/^public\//, "");
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";
  return `${base}/${clean}`;
}
