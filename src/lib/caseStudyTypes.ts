export type CaseStudyStatus = "Pending" | "Approved" | "Rejected";

export interface CaseStudy {
  CaseStudyId: number;
  SessionId: number;
  UserId: number;
  Title: string;
  Sector?: string | null;
  CountryName?: string | null;
  CountryValue?: string | null;
  ModelAndFramworkCoverd?: string | null;
  FileName?: string | null;
  AttachFile?: string | null;
  SubmittedOn?: string | null;
  Status?: CaseStudyStatus | null;
  CaseStudyinfo?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  Email?: string | null;
  DisplayPic?: string | null;
  Specialization?: string | null;
  Education?: string | null;
  RollNo?: string | null;
  SessionName?: string | null;
  Session_Code?: string | null;
}

export interface CommentItem {
  CommentId: number;
  UserId: number;
  CaseStudyId: number;
  Comment: string;
  AddedOn?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  DisplayPic?: string | null;
  RoleId?: number | null;
}

export interface TeacherDataResponse {
  CaseStudy: CaseStudy[];
  NoOfComments: number;
  NoofSession: number;
  Noofstudents: number;
}

export interface TeacherSession {
  SessionId: number;
  SessionName: string;
  Session_Code?: string;
  StartDate?: string | null;
  EndDate?: string | null;
  Active?: boolean | number;
}

export function getAttachmentUrl(path?: string | null): string {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const cleaned = path.replace(/^[\\/]?public[\\/]/, "").replace(/\\/g, "/");
  return `${base.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
}

export function getDisplayStatus(status?: string | null): CaseStudyStatus {
  if (status === "Approved") return "Approved";
  if (status === "Rejected") return "Rejected";
  return "Pending";
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}
