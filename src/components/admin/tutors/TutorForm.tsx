"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, GraduationCap, Lock, MapPin, Camera } from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";
import Button from "/src/components/ui/Button";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { COUNTRY_OPTIONS } from "/src/lib/countries";
import type { Tutor, SessionListItem } from "/src/lib/tutorTypes";

const TUTOR_ROLE_ID = 2;

const EDUCATION_OPTIONS = [
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: "PhD / Doctorate", label: "PhD / Doctorate" },
  { value: "Other Professional Cert", label: "Other Professional Cert" },
];

const SPECIALIZATION_OPTIONS = [
  { value: "K-12 General Education", label: "K-12 General Education" },
  { value: "STEM (Science & Tech)", label: "STEM (Science & Tech)" },
  { value: "Humanities & Arts", label: "Humanities & Arts" },
  { value: "Research & Development (R&D)", label: "Research & Development (R&D)" },
];

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
      DateofBirth: z.string().min(1, "Date of birth is required"),
      Gender: z.string().min(1, "Gender is required"),
      Education: z.string().min(1, "Education is required"),
      Specialization: z.string().min(1, "Specialization is required"),
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

type TutorFormValues = z.infer<ReturnType<typeof buildSchema>>;

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

export interface TutorFormProps {
  mode: "create" | "edit";
  initialValues?: Tutor;
}

export default function TutorForm({ mode, initialValues }: TutorFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [displayPic, setDisplayPic] = useState<string | null>(
    initialValues?.DisplayPic ?? null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialValues?.DisplayPic ? `${process.env.NEXT_PUBLIC_API_URL}${initialValues.DisplayPic}` : null,
  );

  const schema = useMemo(() => buildSchema(mode), [mode]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TutorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      FirstName: initialValues?.FirstName ?? "",
      LastName: initialValues?.LastName ?? "",
      DateofBirth: toDateInputValue(initialValues?.DateofBirth),
      Gender: initialValues?.Gender ?? "",
      Education: initialValues?.Education ?? "",
      Specialization: initialValues?.Specialization ?? "",
      SessionId: initialValues?.Sessions.find((s) => s.SessionId)?.SessionId
        ? String(initialValues.Sessions.find((s) => s.SessionId)?.SessionId)
        : "",
      Email: initialValues?.Email ?? "",
      UserName: initialValues?.UserName ?? "",
      Phone: initialValues?.Phone ?? "",
      CountryValue: initialValues?.CountryValue ?? "",
      Address1: initialValues?.Address1 ?? "",
      Address2: initialValues?.Address2 ?? "",
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
    mutationFn: async (values: TutorFormValues) => {
      const payload = {
        FirstName: values.FirstName,
        LastName: values.LastName,
        DateofBirth: values.DateofBirth,
        Gender: values.Gender,
        Education: values.Education,
        Specialization: values.Specialization,
        SessionId: values.SessionId ? Number(values.SessionId) : undefined,
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
        return apiFetch<[Tutor]>("/AddTeacher", {
          method: "POST",
          body: JSON.stringify({ ...payload, Password: values.Password, RoleId: TUTOR_ROLE_ID }),
        });
      }

      return apiFetch<string>("/AddTeacher", {
        method: "PATCH",
        body: JSON.stringify({ ...payload, Id: initialValues!.Id, UserId: initialValues!.UserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      showToast({
        variant: "success",
        message: mode === "create" ? "Tutor added successfully" : "Tutor updated successfully",
      });
      router.push(mode === "create" ? "/admin/tutors" : `/admin/tutors/${initialValues!.UserId}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && typeof err.body === "string") {
        if (err.body.toLowerCase().includes("email")) {
          setError("Email", { message: err.body });
          return;
        }
        setFormError(err.body);
        return;
      }
      setFormError("Something went wrong. Please try again.");
    },
  });

  function onSubmit(values: TutorFormValues) {
    setFormError(null);
    submitMutation.mutate(values);
  }

  const sessionOptions = [
    { value: "", label: "Not assigned yet" },
    ...(sessionsQuery.data ?? []).map((session) => ({
      value: String(session.SessionId),
      label: `${session.SessionName}${session.SessionYear ? ` (${session.SessionYear})` : ""}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2xl" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-error bg-error-container/20 px-md py-sm text-small text-on-error-container"
        >
          {formError}
        </div>
      )}

      {/* Personal Information */}
      <section className="flex flex-col gap-lg">
        <div className="flex items-center gap-sm">
          <User size={22} className="text-primary" />
          <Heading as="h2" size="h3" className="text-on-surface">
            Personal Information
          </Heading>
        </div>
        <Card padding="lg" className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <Input label="First Name" required error={errors.FirstName?.message} {...register("FirstName")} />
          <Input label="Last Name" required error={errors.LastName?.message} {...register("LastName")} />
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
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            error={errors.Gender?.message}
            {...register("Gender")}
          />
          <div className="col-span-1 flex flex-col gap-sm md:col-span-2">
            <span className="text-caption text-on-surface-variant">Profile Photo</span>
            <div className="flex items-center gap-lg">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-outline bg-surface-container-high">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera size={28} className="text-outline" />
                )}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="w-fit cursor-pointer rounded-lg bg-primary px-lg py-sm text-small font-bold text-on-primary transition-opacity hover:opacity-90">
                  {photoMutation.isPending ? "Uploading…" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
                <span className="text-caption text-on-surface-variant">JPG, PNG or GIF.</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Professional Details */}
      <section className="flex flex-col gap-lg">
        <div className="flex items-center gap-sm">
          <GraduationCap size={22} className="text-primary" />
          <Heading as="h2" size="h3" className="text-on-surface">
            Professional Details
          </Heading>
        </div>
        <Card padding="lg" className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <Select
            label="Highest Education"
            required
            placeholder="Select level"
            options={EDUCATION_OPTIONS}
            error={errors.Education?.message}
            {...register("Education")}
          />
          <Select
            label="Specialization"
            required
            placeholder="Select field"
            options={SPECIALIZATION_OPTIONS}
            error={errors.Specialization?.message}
            {...register("Specialization")}
          />
          <div className="col-span-1 md:col-span-2">
            <Select
              label="Assigned Session"
              options={sessionOptions}
              helper={sessionsQuery.isLoading ? "Loading sessions…" : undefined}
              {...register("SessionId")}
            />
          </div>
        </Card>
      </section>

      {/* Account Credentials */}
      <section className="flex flex-col gap-lg">
        <div className="flex items-center gap-sm">
          <Lock size={22} className="text-primary" />
          <Heading as="h2" size="h3" className="text-on-surface">
            Account Credentials
          </Heading>
        </div>
        <Card padding="lg" className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            required
            error={errors.Email?.message}
            {...register("Email")}
          />
          <Input label="Username" required error={errors.UserName?.message} {...register("UserName")} />
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
        </Card>
      </section>

      {/* Contact Details */}
      <section className="flex flex-col gap-lg">
        <div className="flex items-center gap-sm">
          <MapPin size={22} className="text-primary" />
          <Heading as="h2" size="h3" className="text-on-surface">
            Contact Details
          </Heading>
        </div>
        <Card padding="lg" className="grid grid-cols-1 gap-lg md:grid-cols-2">
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
            placeholder="Select country"
            options={COUNTRY_OPTIONS}
            error={errors.CountryValue?.message}
            {...register("CountryValue")}
          />
          <div className="col-span-1 md:col-span-2">
            <Input label="Address Line 1" required error={errors.Address1?.message} {...register("Address1")} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input label="Address Line 2 (Optional)" {...register("Address2")} />
          </div>
          <Input label="State / Province" required error={errors.State?.message} {...register("State")} />
          <Input label="City" required error={errors.City?.message} {...register("City")} />
          <Input label="Zip / Postal Code" required error={errors.ZipCode?.message} {...register("ZipCode")} />
        </Card>
      </section>

      <div className="sticky bottom-0 flex flex-col gap-md border-t border-outline-variant bg-background/80 p-lg backdrop-blur-md sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || submitMutation.isPending}
          className="order-1 sm:order-2"
        >
          {mode === "create" ? "Add Tutor" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
