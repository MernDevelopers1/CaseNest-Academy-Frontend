"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "/src/components/ui/Input";
import Button from "/src/components/ui/Button";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { useAuthContext } from "/src/components/AuthProvider";
import type { Role } from "/src/components/auth/roles";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  tutor: "Tutor",
  student: "Student",
};

// Exact paths from Backend/src/routes/auth.routes.js.
const LOGIN_PATHS: Record<Role, string> = {
  admin: "/Adminlogin",
  tutor: "/teacherlogin",
  student: "/studentlogin",
};

// All three login endpoints respond 200 with an array whose [0] is the
// user row merged with a Token field, or a plain-text error message on
// failure (403/404) — never JSON, so ApiError.body is just that string.
type LoginResponse = [Record<string, unknown> & { Token: string }];

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");
const passwordSchema = z.string().min(1, "Password is required");

function buildSchema(role: Role) {
  return z
    .object({
      Session_Code: z.string().optional(),
      Email: emailSchema,
      Password: passwordSchema,
    })
    .refine(
      (data) =>
        role !== "student" ||
        Boolean(data.Session_Code && data.Session_Code.length > 0),
      { message: "Session code is required", path: ["Session_Code"] },
    );
}

type LoginFormValues = {
  Session_Code?: string;
  Email: string;
  Password: string;
};

export interface LoginFormProps {
  role: Role;
}

export default function LoginForm({ role }: LoginFormProps) {
  const { showToast } = useToast();
  const { login } = useAuthContext();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(buildSchema(role)),
  });

  async function onSubmit(data: LoginFormValues) {
    setFormError(null);
    const payload =
      role === "student"
        ? {
            Session_Code: data.Session_Code,
            Email: data.Email,
            Password: data.Password,
          }
        : { Email: data.Email, Password: data.Password };

    try {
      const [{ Token, ...user }] = await apiFetch<LoginResponse>(
        LOGIN_PATHS[role],
        { method: "POST", body: JSON.stringify(payload) },
      );
      login(user, role, Token);
      showToast({ variant: "success", message: "Logged in successfully" });
      router.push(`/${role}`);
    } catch (err) {
      setFormError(
        err instanceof ApiError && typeof err.body === "string"
          ? err.body
          : "Something went wrong. Please try again.",
      );
    }
  }

  function handleForgotPassword() {
    showToast({
      variant: "info",
      message: "Password reset isn't available yet",
    });
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <Heading as="h1" size="h2" className="text-on-surface">
          {ROLE_LABELS[role]} Login
        </Heading>
        <Text className="text-on-surface-variant">
          Welcome back — enter your details to continue.
        </Text>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-error bg-error-container/20 px-md py-sm text-small text-on-error-container"
        >
          {formError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-md"
        noValidate
      >
        {role === "student" && (
          <Input
            label="Session Code"
            required
            error={errors.Session_Code?.message}
            {...register("Session_Code")}
          />
        )}
        <Input
          label="Email"
          type="email"
          required
          error={errors.Email?.message}
          {...register("Email")}
        />
        <div className="flex flex-col gap-xs">
          <Input
            label="Password"
            type="password"
            required
            error={errors.Password?.message}
            {...register("Password")}
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className="self-end text-caption text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-sm">
          Log in
        </Button>
      </form>

      {role === "student" && (
        <Text size="small" className="text-center text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/register/student"
            className="text-primary hover:underline"
          >
            Register
          </Link>
        </Text>
      )}
    </div>
  );
}
