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

const tutorSchema = z
  .object({
    FirstName: z.string().min(1, "First name is required"),
    LastName: z.string().min(1, "Last name is required"),
    Email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    UserName: z.string().min(1, "Username is required"),
    Password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    ConfirmPassword: z.string().min(1, "Please confirm your password"),
    Phone: z.string().min(1, "Phone number is required"),
  })
  .refine((data) => data.Password === data.ConfirmPassword, {
    message: "Passwords do not match",
    path: ["ConfirmPassword"],
  });

type TutorSignupFormValues = z.infer<typeof tutorSchema>;

export default function TutorSignupForm() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TutorSignupFormValues>({
    resolver: zodResolver(tutorSchema),
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
          Tutor Sign Up
        </Heading>
        <Text className="text-on-surface-variant">
          Create an account to start reviewing case studies and leading
          discussions.
        </Text>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-md"
        noValidate
      >
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
          label="Username"
          required
          error={errors.UserName?.message}
          {...register("UserName")}
        />
        <Input
          label="Phone"
          type="tel"
          required
          error={errors.Phone?.message}
          {...register("Phone")}
        />
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            required
            error={errors.Password?.message}
            {...register("Password")}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            error={errors.ConfirmPassword?.message}
            {...register("ConfirmPassword")}
          />
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-sm">
          Create account
        </Button>
      </form>

      <Text size="small" className="text-center text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login/tutor" className="text-primary hover:underline">
          Log in
        </Link>
      </Text>
    </div>
  );
}
