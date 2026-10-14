// Profile types and helpers for Admin, Tutor, and Student profiles

export interface UserProfile {
  Id?: number;
  UserId: number;
  FirstName: string | null;
  LastName: string | null;
  Email: string;
  UserName: string | null;
  Phone?: string | null;
  Gender?: string | null;
  DateofBirth?: string | null;
  DateofJoining?: string | null;
  Education?: string | null;
  Specialization?: string | null;
  RollNo?: string | null;
  Address1?: string | null;
  Address2?: string | null;
  City?: string | null;
  State?: string | null;
  ZipCode?: string | null;
  CountryName?: string | null;
  CountryValue?: string | null;
  DisplayPic?: string | null;
  Active?: boolean | number | null;
  RoleId?: number | null;
  RoleName?: string | null;
  SessionId?: number | null;
  SessionName?: string | null;
}

export function formatProfileDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
