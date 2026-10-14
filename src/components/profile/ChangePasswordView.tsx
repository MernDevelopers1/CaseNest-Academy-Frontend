"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";

const changePasswordSchema = z
  .object({
    OldPassword: z.string().min(1, "Current password is required"),
    NewPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
    ConfirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .superRefine((data, ctx) => {
    if (data.NewPassword !== data.ConfirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The new passwords do not match",
        path: ["ConfirmPassword"],
      });
    }
    if (data.OldPassword && data.NewPassword && data.OldPassword === data.NewPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be different from your current password",
        path: ["NewPassword"],
      });
    }
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordViewProps {
  role: "admin" | "tutor" | "student";
  backHref: string;
}

export default function ChangePasswordView({
  role,
  backHref,
}: ChangePasswordViewProps) {
  const { showToast } = useToast();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      OldPassword: "",
      NewPassword: "",
      ConfirmPassword: "",
    },
  });

  const newPasswordValue = watch("NewPassword") || "";

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPasswordValue) return { score: 0, label: "", color: "" };
    let score = 0;
    if (newPasswordValue.length >= 8) score++;
    if (/[A-Z]/.test(newPasswordValue)) score++;
    if (/[0-9]/.test(newPasswordValue)) score++;
    if (/[^A-Za-z0-9]/.test(newPasswordValue)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500 text-rose-500" };
    if (score <= 3) return { score: 2, label: "Moderate", color: "bg-amber-500 text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500 text-emerald-500" };
  }, [newPasswordValue]);

  const onSubmit = async (values: ChangePasswordFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      await apiFetch("/ChangePassword", {
        method: "POST",
        body: JSON.stringify({
          OldPassword: values.OldPassword,
          NewPassword: values.NewPassword,
        }),
      });

      setIsSuccess(true);
      reset();
      showToast({
        variant: "success",
        message: "Your password has been changed successfully.",
      });
    } catch (err) {
      console.error("Change password error:", err);
      const msg =
        err instanceof ApiError && typeof err.body === "string"
          ? err.body
          : "Failed to update password. Please check your current password.";
      setServerError(msg);
      showToast({
        variant: "error",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const portalHome = `/${role}`;

  return (
    <div className="flex flex-col gap-xl max-w-xl mx-auto pb-3xl">
      {/* Header Breadcrumb */}
      <div className="flex flex-col gap-xs border-b border-outline-variant pb-lg">
        <Link
          href={backHref}
          className="text-caption font-medium text-primary hover:underline flex items-center gap-xs w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </Link>
        <Heading as="h1" size="h2" className="text-on-surface">
          Change Password
        </Heading>
        <p className="text-small text-on-surface-variant">
          Update your account security credentials with a strong password.
        </p>
      </div>

      {isSuccess ? (
        <Card className="p-2xl border border-emerald-500/30 bg-surface text-center flex flex-col items-center justify-center gap-md shadow-xs">
          <div className="p-lg rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={44} />
          </div>
          <Heading as="h2" size="h3" className="text-on-surface">
            Password Updated Successfully
          </Heading>
          <p className="text-small text-on-surface-variant max-w-md">
            Your login password has been changed. Your account is now secured with your new credentials.
          </p>
          <div className="flex items-center gap-sm mt-md">
            <Link href={portalHome}>
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setIsSuccess(false);
              }}
            >
              Change Again
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-xl border border-outline-variant bg-surface shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
            {serverError && (
              <div className="p-md rounded-xl border border-error/30 bg-error/5 flex items-center gap-sm text-small text-error">
                <AlertCircle size={18} className="shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Old Password */}
            <div className="flex flex-col gap-xs">
              <label
                htmlFor="old-password"
                className="text-caption text-on-surface-variant font-medium"
              >
                Current Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="old-password"
                  type={showOld ? "text" : "password"}
                  placeholder="Enter your current password"
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-lg border bg-surface px-md pr-10 text-small text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 ${
                    errors.OldPassword
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  {...register("OldPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  aria-label={showOld ? "Hide current password" : "Show current password"}
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.OldPassword && (
                <p className="text-caption text-error">{errors.OldPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-xs">
              <label
                htmlFor="new-password"
                className="text-caption text-on-surface-variant font-medium"
              >
                New Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password (min. 6 characters)"
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-lg border bg-surface px-md pr-10 text-small text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 ${
                    errors.NewPassword
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  {...register("NewPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.NewPassword ? (
                <p className="text-caption text-error">{errors.NewPassword.message}</p>
              ) : (
                <p className="text-caption text-on-surface-variant">
                  Must be at least 6 characters. Use letters, numbers & symbols for best security.
                </p>
              )}

              {/* Strength Meter Bar */}
              {newPasswordValue.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-on-surface-variant">Password Strength:</span>
                    <span className={`font-semibold ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full ${
                        strength.score >= 1 ? strength.color.split(" ")[0] : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        strength.score >= 2 ? strength.color.split(" ")[0] : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        strength.score >= 3 ? strength.color.split(" ")[0] : "bg-transparent"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-xs">
              <label
                htmlFor="confirm-password"
                className="text-caption text-on-surface-variant font-medium"
              >
                Confirm New Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-lg border bg-surface px-md pr-10 text-small text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 ${
                    errors.ConfirmPassword
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  {...register("ConfirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.ConfirmPassword && (
                <p className="text-caption text-error">{errors.ConfirmPassword.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-sm border-t border-outline-variant pt-lg mt-sm">
              <Link href={backHref} className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-xs"
              >
                <Lock size={15} />
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
