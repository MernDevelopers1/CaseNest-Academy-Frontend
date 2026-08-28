"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "/src/components/ui/Input";
import Button from "/src/components/ui/Button";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import { useToast } from "/src/components/ui/Toast";
import type { Role } from "/src/components/auth/roles";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  tutor: "Tutor",
  student: "Student",
};

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
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(buildSchema(role)),
  });

  async function onSubmit() {
    setFormError(null);
    // Real submission (task 2g) lands once the sign-up forms exist too —
    // for now this just proves the form/validation plumbing works.
    await new Promise((resolve) => setTimeout(resolve, 600));
    showToast({
      variant: "info",
      message: "Login UI built — wiring lands in the next phase",
    });
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

      {(role === "tutor" || role === "student") && (
        <Text size="small" className="text-center text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register/${role}`}
            className="text-primary hover:underline"
          >
            Register
          </Link>
        </Text>
      )}
    </div>
  );
}
