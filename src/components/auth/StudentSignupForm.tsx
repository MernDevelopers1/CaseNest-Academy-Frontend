"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "/src/components/ui/Input";
import Button from "/src/components/ui/Button";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import { useToast } from "/src/components/ui/Toast";

const studentSchema = z.object({
  Session_Code: z.string().min(1, "Session code is required"),
  FirstName: z.string().min(1, "First name is required"),
  LastName: z.string().min(1, "Last name is required"),
  Email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  Password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type StudentSignupFormValues = z.infer<typeof studentSchema>;

export default function StudentSignupForm() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentSignupFormValues>({
    resolver: zodResolver(studentSchema),
  });

  async function onSubmit() {
    // Real submission lands in the final Phase 2 prompt (2e + 2g), once
    // every form built across these prompts exists.
    await new Promise((resolve) => setTimeout(resolve, 600));
    showToast({
      variant: "info",
      message: "Sign-up UI built — wiring lands in the next phase",
    });
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <Heading as="h1" size="h2" className="text-on-surface">
          Student Sign Up
        </Heading>
        <Text className="text-on-surface-variant">
          Create an account to submit case studies and learn alongside your
          peers.
        </Text>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-md"
        noValidate
      >
        <Input
          label="Session Code"
          required
          helper="Ask your tutor for the session code — a valid one is required to register into a class."
          error={errors.Session_Code?.message}
          {...register("Session_Code")}
        />
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <Input
            label="First name"
            required
            error={errors.FirstName?.message}
            {...register("FirstName")}
          />
          <Input
            label="Last name"
            required
            error={errors.LastName?.message}
            {...register("LastName")}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          error={errors.Email?.message}
          {...register("Email")}
        />
        <Input
          label="Password"
          type="password"
          required
          error={errors.Password?.message}
          {...register("Password")}
        />

        <Button type="submit" loading={isSubmitting} className="mt-sm">
          Create account
        </Button>
      </form>

      <Text size="small" className="text-center text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login/student" className="text-primary hover:underline">
          Log in
        </Link>
      </Text>
    </div>
  );
}
