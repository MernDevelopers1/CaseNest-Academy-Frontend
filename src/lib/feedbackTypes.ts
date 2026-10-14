// TypeScript definitions and helper utilities for Feedback items.

export interface FeedbackItem {
  FeedbackId: number;
  UserId: number;
  FirstName: string | null;
  LastName: string | null;
  Email?: string | null;
  DisplayPic?: string | null;
  Education?: string | null;
  Specialization?: string | null;
  RollNo?: string | null;
  Gender: string;
  Age: string;
  Experience: string;
  EducationYears: string;
  SectorExperiance: string;
  geoLocation: string;
  UseExpBefore: string;
  Usefull: string;
  OwnBackExpUnderstandingStratMang: string;
  UnderstandingSM: string;
  ExpInYourLearn: string;
  BackExpInClass: string;
  LearnFromOther: string;
  ImprovedInFuture: string;
  AnyOtherComment: string;
  Permission: string;
}

export function parseRatingScore(val: string | null | undefined): number {
  if (!val) return 5;
  const num = Number(val);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return Math.round(num);
  }
  const lower = val.toLowerCase();
  if (lower.includes("strongly agree") || lower.includes("extremely") || lower.includes("excellent")) {
    return 5;
  }
  if (lower.includes("agree") || lower.includes("very") || lower.includes("good")) {
    return 4;
  }
  if (lower.includes("neutral") || lower.includes("moderate") || lower.includes("useful")) {
    return 4;
  }
  if (lower.includes("somewhat") || lower.includes("fair")) {
    return 3;
  }
  if (lower.includes("disagree") || lower.includes("poor") || lower.includes("not")) {
    return 2;
  }
  return 5;
}

export function getFeedbackSubmitterName(item: FeedbackItem): string {
  const parts = [item.FirstName, item.LastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : `Student #${item.UserId}`;
}

export function getFeedbackInitials(item: FeedbackItem): string {
  const first = item.FirstName?.charAt(0) ?? "";
  const last = item.LastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "ST";
}
