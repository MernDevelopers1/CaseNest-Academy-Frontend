"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, School, Lock, MapPin, Camera } from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";
import Button from "/src/components/ui/Button";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { COUNTRY_OPTIONS } from "/src/lib/countries";
import type { Student } from "/src/lib/studentTypes";
import type { SessionListItem } from "/src/lib/tutorTypes";

const STUDENT_ROLE_ID = 3;

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

function buildSchema(mode: "create" | "edit") {
  return z
    .object({
      FirstName: z.string().min(1, "First name is required"),
      LastName: z.string().min(1, "Last name is required"),
      RollNo: z.string().optional(),
      DateofBirth: z.string().min(1, "Date of birth is required"),
      Gender: z.string().min(1, "Gender is required"),
      Education: z.string().optional(),
      Specialization: z.string().optional(),
      SessionId: z.string().optional(),
      Email: z.string().min(1, "Email is required").email("Enter a valid email address"),
      UserName: z.string().min(1, "Username is required"),
      Password: z.string().optional(),
      ConfirmPassword: z.string().optional(),
      Phone: z.string().min(1, "Phone number is required"),
      CountryValue: z.string().min(1, "Country is required"),
      Address1: z.string().min(1, "Address is required"),
      Address2: z.string().optional(),
      State: z.string().min(1, "State is required"),
      City: z.string().min(1, "City is required"),
      ZipCode: z.string().min(1, "Zip code is required"),
    })
    .superRefine((data, ctx) => {
      if (mode !== "create") return;
      if (!data.Password || data.Password.length < 6) {
        ctx.addIssue({
          code: "custom",
          message: "Password must be at least 6 characters",
          path: ["Password"],
        });
      }
      if (data.Password !== data.ConfirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords don't match",
          path: ["ConfirmPassword"],
        });
      }
    });
}

type StudentFormValues = z.infer<ReturnType<typeof buildSchema>>;

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Photo upload failed");
  const uploaded: { filename: string } = await response.json();
  return `/profile/${uploaded.filename}`;
}

export interface StudentFormProps {
  mode: "create" | "edit";
  initialValues?: Student;
}

export default function StudentForm({ mode, initialValues }: StudentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [displayPic, setDisplayPic] = useState<string | null>(
    initialValues?.DisplayPic ?? null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialValues?.DisplayPic
      ? `${process.env.NEXT_PUBLIC_API_URL}${initialValues.DisplayPic}`
      : null,
  );

  const schema = useMemo(() => buildSchema(mode), [mode]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      FirstName: initialValues?.FirstName ?? "",
      LastName: initialValues?.LastName ?? "",
      RollNo: initialValues?.RollNo && initialValues.RollNo !== "null" ? initialValues.RollNo : "",
      DateofBirth: toDateInputValue(initialValues?.DateofBirth),
      Gender: initialValues?.Gender ?? "",
      Education: initialValues?.Education && initialValues.Education !== "null" ? initialValues.Education : "",
      Specialization: initialValues?.Specialization && initialValues.Specialization !== "null" ? initialValues.Specialization : "",
      SessionId: initialValues?.Sessions?.find((s) => s.SessionId)?.SessionId
        ? String(initialValues.Sessions.find((s) => s.SessionId)?.SessionId)
        : "",
      Email: initialValues?.Email ?? "",
      UserName: initialValues?.UserName ?? "",
      Phone: initialValues?.Phone ?? "",
      CountryValue: initialValues?.CountryValue ?? "",
      Address1: initialValues?.Address1 ?? "",
      Address2: initialValues?.Address2 && initialValues.Address2 !== "null" ? initialValues.Address2 : "",
      State: initialValues?.State ?? "",
      City: initialValues?.City ?? "",
      ZipCode: initialValues?.ZipCode ?? "",
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions-list"],
    queryFn: () => apiFetch<SessionListItem[]>("/AddSession"),
  });

  const photoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (path) => setDisplayPic(path),
    onError: () =>
      showToast({ variant: "error", message: "Photo upload failed — please try again." }),
  });

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    photoMutation.mutate(file);
  }

  const submitMutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const selectedSession = sessionsQuery.data?.find(
        (s) => String(s.SessionId) === values.SessionId,
      );

      const payload = {
        FirstName: values.FirstName,
        LastName: values.LastName,
        RollNo: values.RollNo || undefined,
        DateofBirth: values.DateofBirth,
        Gender: values.Gender,
        Education: values.Education || undefined,
        Specialization: values.Specialization || undefined,
        SessionId: values.SessionId ? Number(values.SessionId) : undefined,
        Session_Code: selectedSession?.SessionName || undefined,
        Email: values.Email,
        UserName: values.UserName,
        Phone: values.Phone,
        CountryValue: values.CountryValue,
        CountryName:
          COUNTRY_OPTIONS.find((option) => option.value === values.CountryValue)?.label ?? "",
        Address1: values.Address1,
        Address2: values.Address2 || undefined,
        State: values.State,
        City: values.City,
        ZipCode: values.ZipCode,
        DisplayPic: displayPic ?? undefined,
      };

      if (mode === "create") {
        return apiFetch<[Student]>("/AddStudent", {
          method: "POST",
          body: JSON.stringify({ ...payload, Password: values.Password, RoleId: STUDENT_ROLE_ID }),
        });
      }

      return apiFetch<string>("/AddStudent", {
        method: "PATCH",
        body: JSON.stringify({ ...payload, Id: initialValues!.Id, UserId: initialValues!.UserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      showToast({
        variant: "success",
        message: mode === "create" ? "Student added successfully" : "Student updated successfully",
      });
      router.push(mode === "create" ? "/admin/students" : `/admin/students/${initialValues!.UserId}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && typeof err.body === "string") {
        if (err.body.toLowerCase().includes("email")) {
          setError("Email", { message: err.body });
          return;
        }
        if (err.body.toLowerCase().includes("session")) {
          setError("SessionId", { message: err.body });
          return;
        }
        setFormError(err.body);
        return;
      }
      setFormError("Something went wrong. Please try again.");
    },
  });

  function onSubmit(values: StudentFormValues) {
    setFormError(null);
    submitMutation.mutate(values);
  }

  const sessionOptions = [
    { value: "", label: "Select academic session" },
    ...(sessionsQuery.data?.map((s) => ({
      value: String(s.SessionId),
      label: s.SessionYear ? `${s.SessionName} (${s.SessionYear})` : s.SessionName,
    })) ?? []),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-xl pb-2xl" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-error bg-error-container/20 p-md text-small text-on-error-container"
        >
          {formError}
        </div>
      )}

      {/* 1. Personal Information */}
      <Card>
        <div className="flex items-center gap-xs border-b border-outline-variant pb-md text-primary">
          <User size={20} />
          <Heading as="h2" size="h3">
            Personal Information
          </Heading>
        </div>

        <div className="mt-lg flex flex-col gap-lg">
          {/* Photo upload */}
          <div className="flex flex-col items-center gap-md sm:flex-row">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant bg-surface-container">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User size={36} className="text-outline" />
                )}
              </div>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary shadow transition-transform hover:scale-105"
              >
                <Camera size={16} />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <div className="text-small font-bold text-on-surface">Student Profile Photo</div>
              <div className="text-caption text-on-surface-variant">
                Upload a clear JPG or PNG image. Max 5MB.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <Input
              label="First Name"
              required
              error={errors.FirstName?.message}
              {...register("FirstName")}
            />
            <Input
              label="Last Name"
              required
              error={errors.LastName?.message}
              {...register("LastName")}
            />
            <Input
              label="Roll Number / Student ID"
              placeholder="e.g. STU-2024-001"
              error={errors.RollNo?.message}
              {...register("RollNo")}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              error={errors.DateofBirth?.message}
              {...register("DateofBirth")}
            />
            <Select
              label="Gender"
              required
              options={[{ value: "", label: "Select gender" }, ...GENDER_OPTIONS]}
              error={errors.Gender?.message}
              {...register("Gender")}
            />
          </div>
        </div>
      </Card>

      {/* 2. Enrollment Details */}
      <Card>
        <div className="flex items-center gap-xs border-b border-outline-variant pb-md text-primary">
          <School size={20} />
          <Heading as="h2" size="h3">
            Enrollment Details
          </Heading>
        </div>

        <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-2">
          <Select
            label="Assigned Session"
            options={sessionOptions}
            error={errors.SessionId?.message}
            {...register("SessionId")}
          />
        </div>
      </Card>

      {/* 3. Account Credentials */}
      <Card>
        <div className="flex items-center gap-xs border-b border-outline-variant pb-md text-primary">
          <Lock size={20} />
          <Heading as="h2" size="h3">
            Account Credentials
          </Heading>
        </div>

        <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-2">
          <Input
            label="Email Address"
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
          {mode === "create" && (
            <>
              <Input
                label="Password"
                type="password"
                required
                error={errors.Password?.message}
                {...register("Password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                error={errors.ConfirmPassword?.message}
                {...register("ConfirmPassword")}
              />
            </>
          )}
        </div>
      </Card>

      {/* 4. Contact & Location Details */}
      <Card>
        <div className="flex items-center gap-xs border-b border-outline-variant pb-md text-primary">
          <MapPin size={20} />
          <Heading as="h2" size="h3">
            Contact & Location Details
          </Heading>
        </div>

        <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-2">
          <Input
            label="Phone Number"
            type="tel"
            required
            error={errors.Phone?.message}
            {...register("Phone")}
          />
          <Select
            label="Country"
            required
            options={[{ value: "", label: "Select country" }, ...COUNTRY_OPTIONS]}
            error={errors.CountryValue?.message}
            {...register("CountryValue")}
          />
          <div className="md:col-span-2">
            <Input
              label="Address Line 1"
              required
              error={errors.Address1?.message}
              {...register("Address1")}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Address Line 2 (Optional)"
              error={errors.Address2?.message}
              {...register("Address2")}
            />
          </div>
          <Input
            label="State / Province"
            required
            error={errors.State?.message}
            {...register("State")}
          />
          <Input
            label="City"
            required
            error={errors.City?.message}
            {...register("City")}
          />
          <Input
            label="Zip / Postal Code"
            required
            error={errors.ZipCode?.message}
            {...register("ZipCode")}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col items-center justify-end gap-md sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || submitMutation.isPending}
          className="w-full sm:w-auto"
        >
          {mode === "create" ? "Add Student" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
