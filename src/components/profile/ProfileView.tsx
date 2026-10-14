"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  IdCard,
  Building,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import {
  getUserDisplayName,
  getUserId,
  getUserDisplayPic,
  getUserSessionName,
} from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import Avatar from "/src/components/ui/Avatar";
import { apiFetch } from "/src/lib/api";
import { COUNTRY_OPTIONS } from "/src/lib/countries";
import type { UserProfile } from "/src/lib/profileTypes";
import { formatProfileDate } from "/src/lib/profileTypes";

interface ProfileViewProps {
  role: "admin" | "tutor" | "student";
  changePasswordHref: string;
}

export default function ProfileView({
  role,
  changePasswordHref,
}: ProfileViewProps) {
  const { user } = useAuthContext();
  const userId = getUserId(user);
  const contextName = getUserDisplayName(user);
  const contextPic = getUserDisplayPic(user);
  const contextSession = getUserSessionName(user);

  // Fetch full live profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => apiFetch<UserProfile | null>("/profile"),
    enabled: Boolean(userId),
  });

  // Merge live profile data with AuthContext fallback
  const profile = useMemo(() => {
    if (profileData) return profileData;
    if (!user) return null;

    return {
      UserId: userId || 0,
      FirstName: (user.FirstName as string) || null,
      LastName: (user.LastName as string) || null,
      Email: (user.Email as string) || "",
      UserName: (user.UserName as string) || null,
      Phone: (user.Phone as string) || null,
      Gender: (user.Gender as string) || null,
      DateofBirth: (user.DateofBirth as string) || null,
      DateofJoining: (user.DateofJoining as string) || (user.CreateDate as string) || null,
      Education: (user.Education as string) || null,
      Specialization: (user.Specialization as string) || null,
      RollNo: (user.RollNo as string) || null,
      Address1: (user.Address1 as string) || null,
      Address2: (user.Address2 as string) || null,
      City: (user.City as string) || null,
      State: (user.State as string) || null,
      ZipCode: (user.ZipCode as string) || null,
      CountryName: (user.CountryName as string) || null,
      CountryValue: (user.CountryValue as string) || null,
      DisplayPic: contextPic || null,
      Active: user.Active as boolean | number | null,
      SessionName: contextSession || null,
    } as UserProfile;
  }, [profileData, user, userId, contextPic, contextSession]);

  const fullName =
    profile && [profile.FirstName, profile.LastName].filter(Boolean).join(" ")
      ? [profile.FirstName, profile.LastName].filter(Boolean).join(" ")
      : contextName || "Account User";

  const roleLabel =
    role === "admin"
      ? "Platform Administrator"
      : role === "tutor"
      ? "Course Tutor / Faculty"
      : "Cohort Student";

  const countryName = profile?.CountryName;
  const countryValue = profile?.CountryValue;

  const resolvedCountry = useMemo(() => {
    if (countryName) return countryName;
    if (countryValue) {
      const match = COUNTRY_OPTIONS.find((c) => c.value === countryValue);
      return match ? match.label : countryValue;
    }
    return null;
  }, [countryName, countryValue]);

  const fullAddress = useMemo(() => {
    const parts = [
      profile?.Address1,
      profile?.Address2,
      profile?.City,
      profile?.State,
      profile?.ZipCode,
      resolvedCountry,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  }, [profile, resolvedCountry]);

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col gap-xl max-w-5xl mx-auto pb-2xl">
        <div className="h-44 rounded-2xl bg-surface-container animate-pulse border border-outline-variant" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="h-64 rounded-2xl bg-surface-container animate-pulse border border-outline-variant" />
          <div className="h-64 rounded-2xl bg-surface-container animate-pulse border border-outline-variant" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl max-w-5xl mx-auto pb-3xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface p-xl shadow-xs">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-lg">
          <div className="flex items-center gap-lg">
            <Avatar
              src={profile?.DisplayPic ?? undefined}
              name={fullName}
              size="lg"
              className="border-2 border-primary/20 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-xs">
                <Heading as="h1" size="h2" className="text-on-surface">
                  {fullName}
                </Heading>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-semibold bg-primary/10 text-primary">
                  <ShieldCheck size={12} />
                  {roleLabel}
                </span>
              </div>

              <p className="mt-xs text-small text-on-surface-variant flex items-center gap-xs">
                <Mail size={14} />
                <span>{profile?.Email || "No email on record"}</span>
              </p>

              {(profile?.Phone || resolvedCountry) && (
                <div className="mt-1 flex flex-wrap items-center gap-md text-caption text-on-surface-variant">
                  {profile?.Phone && (
                    <span className="flex items-center gap-xs">
                      <Phone size={13} />
                      {profile.Phone}
                    </span>
                  )}
                  {resolvedCountry && (
                    <span className="flex items-center gap-xs">
                      <MapPin size={13} />
                      {resolvedCountry}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link href={changePasswordHref} className="shrink-0">
            <Button variant="secondary" className="gap-xs">
              <KeyRound size={16} />
              Change Password
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Details Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Card 1: Account Information */}
        <Card className="p-xl border border-outline-variant bg-surface flex flex-col gap-md">
          <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
            <IdCard size={18} />
            <span>Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-small">
            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Username
              </span>
              <p className="font-semibold text-on-surface mt-0.5">
                {profile?.UserName || "—"}
              </p>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Account Status
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {profile?.Active === false ? "Suspended" : "Active & Verified"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                User ID
              </span>
              <p className="font-semibold text-on-surface mt-0.5">
                #{profile?.UserId || userId || "—"}
              </p>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Member Since
              </span>
              <p className="font-semibold text-on-surface mt-0.5 flex items-center gap-xs">
                <Calendar size={13} className="text-on-surface-variant" />
                <span>{formatProfileDate(profile?.DateofJoining)}</span>
              </p>
            </div>

            {profile?.Gender && (
              <div>
                <span className="text-caption uppercase text-on-surface-variant font-medium">
                  Gender
                </span>
                <p className="font-semibold text-on-surface mt-0.5">
                  {profile.Gender}
                </p>
              </div>
            )}

            {profile?.DateofBirth && (
              <div>
                <span className="text-caption uppercase text-on-surface-variant font-medium">
                  Date of Birth
                </span>
                <p className="font-semibold text-on-surface mt-0.5">
                  {formatProfileDate(profile.DateofBirth)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Academic & Cohort Profile */}
        <Card className="p-xl border border-outline-variant bg-surface flex flex-col gap-md">
          <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
            <GraduationCap size={18} />
            <span>Academic & Professional Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-small">
            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Education / Highest Degree
              </span>
              <p className="font-semibold text-on-surface mt-0.5">
                {profile?.Education || "Not specified"}
              </p>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Specialization / Field
              </span>
              <p className="font-semibold text-on-surface mt-0.5">
                {profile?.Specialization || "Not specified"}
              </p>
            </div>

            {role === "student" && (
              <>
                <div>
                  <span className="text-caption uppercase text-on-surface-variant font-medium">
                    Student Roll Number
                  </span>
                  <p className="font-semibold text-on-surface mt-0.5">
                    {profile?.RollNo || "—"}
                  </p>
                </div>

                <div>
                  <span className="text-caption uppercase text-on-surface-variant font-medium">
                    Enrolled Session
                  </span>
                  <p className="font-semibold text-on-surface mt-0.5">
                    {profile?.SessionName || contextSession || "General Cohort"}
                  </p>
                </div>
              </>
            )}

            {role === "tutor" && (
              <div className="sm:col-span-2">
                <span className="text-caption uppercase text-on-surface-variant font-medium">
                  Teaching Assignment
                </span>
                <p className="font-semibold text-on-surface mt-0.5">
                  Assigned Cohorts & Case Study Moderation
                </p>
              </div>
            )}

            {role === "admin" && (
              <div className="sm:col-span-2">
                <span className="text-caption uppercase text-on-surface-variant font-medium">
                  Administrative Clearance
                </span>
                <p className="font-semibold text-on-surface mt-0.5">
                  Full System Superadmin Clearance
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Contact & Address Information */}
        <Card className="md:col-span-2 p-xl border border-outline-variant bg-surface flex flex-col gap-md">
          <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
            <Building size={18} />
            <span>Contact & Address Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md text-small">
            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Email Address
              </span>
              <p className="font-medium text-on-surface mt-0.5">
                {profile?.Email || "—"}
              </p>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Phone Number
              </span>
              <p className="font-medium text-on-surface mt-0.5">
                {profile?.Phone || "—"}
              </p>
            </div>

            <div>
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Country
              </span>
              <p className="font-medium text-on-surface mt-0.5">
                {resolvedCountry || "—"}
              </p>
            </div>

            <div className="sm:col-span-3">
              <span className="text-caption uppercase text-on-surface-variant font-medium">
                Physical / Postal Address
              </span>
              <p className="font-medium text-on-surface mt-0.5">
                {fullAddress}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
