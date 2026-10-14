"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  Clock,
  Layers,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import {
  getUserId,
  getUserSessionId,
  getUserSessionName,
} from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import { Input } from "/src/components/ui/Input";
import { Select } from "/src/components/ui/Select";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import { COUNTRY_OPTIONS } from "/src/lib/countries";
import type { Session } from "/src/lib/sessionTypes";

// Validation Schema
const submitCaseStudySchema = z.object({
  Title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  SessionId: z.string().min(1, "Please select an enrolled session"),
  Sector: z
    .string()
    .min(2, "Sector is required (e.g. Technology, Healthcare, Energy, Finance)")
    .max(100, "Sector cannot exceed 100 characters"),
  CountryValue: z.string().min(1, "Please select a country"),
  ModelAndFramworkCoverd: z
    .string()
    .min(
      2,
      "Please enter the models covered (e.g. Porter's 5 Forces, SWOT, PESTEL)"
    )
    .max(200, "Models/Frameworks cannot exceed 200 characters"),
  Description: z
    .string()
    .min(10, "Summary & context must be at least 10 characters")
    .max(2500, "Summary cannot exceed 2500 characters"),
});

type SubmitFormData = z.infer<typeof submitCaseStudySchema>;

interface UploadedFileState {
  path: string;
  filename: string;
  originalname: string;
  size: number;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".pptx", ".xlsx", ".txt"];

export default function StudentSubmitPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = getUserId(user);
  const enrolledSessionId = getUserSessionId(user);
  const enrolledSessionName = getUserSessionName(user);

  const { showToast } = useToast();

  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Fetch available sessions for student selection if needed
  const sessionsQuery = useQuery({
    queryKey: ["sessions-list"],
    queryFn: () => apiFetch<Session[]>("/session"),
  });

  const sessionOptions = useMemo(() => {
    const list = sessionsQuery.data ?? [];
    if (list.length === 0 && enrolledSessionId && enrolledSessionName) {
      return [{ value: String(enrolledSessionId), label: enrolledSessionName }];
    }
    return list.map((s) => ({
      value: String(s.SessionId),
      label: s.SessionName,
    }));
  }, [sessionsQuery.data, enrolledSessionId, enrolledSessionName]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitCaseStudySchema),
    defaultValues: {
      Title: "",
      SessionId: enrolledSessionId ? String(enrolledSessionId) : "",
      Sector: "",
      CountryValue: "",
      ModelAndFramworkCoverd: "",
      Description: "",
    },
  });

  // Handle file selection & upload
  const handleFileChange = async (file: File | null) => {
    setFileError(null);
    if (!file) return;

    // Check file extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(
        `Invalid file type (${ext}). Allowed formats: PDF, DOC, DOCX, PPTX, XLSX, TXT.`
      );
      return;
    }

    // Check file size (15MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(
        `File is too large (${sizeMB}MB). Maximum allowed file size is 15MB.`
      );
      return;
    }

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch<{
        path: string;
        filename: string;
        originalname: string;
        size?: number;
      }>("/fileupload", {
        method: "POST",
        body: formData,
      });

      setUploadedFile({
        path: res.path,
        filename: res.filename || file.name,
        originalname: res.originalname || file.name,
        size: res.size ?? file.size,
      });
      setFileError(null);
    } catch (err) {
      console.error("Upload error:", err);
      setFileError(
        err instanceof ApiError && typeof err.body === "string"
          ? err.body
          : "Failed to upload document. Please verify the file and try again."
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Form Submission
  const onSubmit = async (values: SubmitFormData) => {
    if (!uploadedFile) {
      setFileError("Please upload your case study file before submitting.");
      return;
    }
    if (!userId) {
      showToast({
        variant: "error",
        message: "You must be logged in as a student to submit a case study.",
      });
      return;
    }

    setIsSubmittingForm(true);

    const countryObj = COUNTRY_OPTIONS.find((c) => c.value === values.CountryValue);
    const countryName = countryObj ? countryObj.label : values.CountryValue;

    const payload = {
      SessionId: Number(values.SessionId),
      UserId: userId,
      Title: values.Title.trim(),
      Sector: values.Sector.trim(),
      CountryName: countryName,
      CountryValue: values.CountryValue,
      ModelAndFramworkCoverd: values.ModelAndFramworkCoverd.trim(),
      FileName: uploadedFile.filename,
      AttachFile: uploadedFile.path,
      CaseStudyinfo: JSON.stringify({
        description: values.Description.trim(),
        originalFileName: uploadedFile.originalname,
      }),
    };

    try {
      await apiFetch("/AddCaseStudy", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast({
        variant: "success",
        message:
          "Case study submitted successfully! It is now pending tutor review.",
      });

      router.push("/student/case-studies");
    } catch (err) {
      console.error("Submission error:", err);
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to submit case study. Please check all fields.",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-xl max-w-4xl mx-auto pb-2xl">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col gap-xs border-b border-outline-variant pb-lg">
        <Link
          href="/student/case-studies"
          className="text-caption font-medium text-primary hover:underline flex items-center gap-xs w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to My Case Studies</span>
        </Link>
        <Heading as="h1" size="h2" className="text-on-surface">
          Submit Case Study
        </Heading>
        <p className="text-small text-on-surface-variant">
          Upload your strategic management research paper for cohort peer-learning.
        </p>
      </div>

      {/* Review Process Information Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-lg flex items-start gap-md text-small text-on-surface">
        <div className="p-xs rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Clock size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-primary">
            Peer Learning Review Process
          </p>
          <p className="text-caption text-on-surface-variant leading-relaxed">
            Your case study will be submitted in <strong>Pending Review</strong> status.
            Once your course tutor reviews and approves the submission, it will be published
            to the Classmate Directory so peers can read your findings, engage in discussions,
            and share feedback.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-xl border border-outline-variant bg-surface">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-xl">
          {/* Section 1: Overview & Session */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <FileText size={16} />
              <span>General Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Title */}
              <div className="md:col-span-2">
                <Input
                  label="Case Study Title"
                  required
                  placeholder="e.g. Digital Transformation Strategy at Netflix (2020-2024)"
                  error={errors.Title?.message}
                  helper="Choose a clear, descriptive title representing your research."
                  {...register("Title")}
                />
              </div>

              {/* Session */}
              <div>
                <Select
                  label="Course Session"
                  required
                  placeholder="Select session"
                  options={sessionOptions}
                  error={errors.SessionId?.message}
                  {...register("SessionId")}
                />
              </div>

              {/* Sector */}
              <div>
                <Input
                  label="Industry / Sector"
                  required
                  placeholder="e.g. Technology, Retail, Automotive"
                  error={errors.Sector?.message}
                  {...register("Sector")}
                />
              </div>

              {/* Country */}
              <div>
                <Select
                  label="Geographical Focus (Country)"
                  required
                  placeholder="Select primary country"
                  options={COUNTRY_OPTIONS}
                  error={errors.CountryValue?.message}
                  {...register("CountryValue")}
                />
              </div>

              {/* Models and Frameworks Covered */}
              <div>
                <Input
                  label="Models & Frameworks Covered"
                  required
                  placeholder="e.g. Porter's Five Forces, VRIO, Ansoff Matrix"
                  error={errors.ModelAndFramworkCoverd?.message}
                  {...register("ModelAndFramworkCoverd")}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Case Summary */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <Layers size={16} />
              <span>Case Study Context & Overview</span>
            </div>

            <div className="flex flex-col gap-xs">
              <label
                htmlFor="case-study-description"
                className="text-caption text-on-surface-variant font-medium"
              >
                Executive Summary / Description <span className="text-error">*</span>
              </label>
              <textarea
                id="case-study-description"
                rows={5}
                placeholder="Provide a concise summary of the business scenario, strategic dilemma, methodology applied, and key findings..."
                className={`w-full rounded-lg border bg-surface p-md text-small text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 ${
                  errors.Description
                    ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                    : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
                {...register("Description")}
              />
              {errors.Description ? (
                <p className="text-caption text-error">
                  {errors.Description.message}
                </p>
              ) : (
                <p className="text-caption text-on-surface-variant">
                  This summary will be displayed in the preview card for classmates.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Document Upload */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <Upload size={16} />
              <span>Attach Case Study Document</span>
            </div>

            <div className="flex flex-col gap-sm">
              <label className="text-caption text-on-surface-variant font-medium">
                Research Paper Document <span className="text-error">*</span>
              </label>

              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-xl flex flex-col items-center justify-center text-center transition-colors ${
                    fileError
                      ? "border-error/60 bg-error/5"
                      : "border-outline-variant hover:border-primary/50 bg-surface-container-low"
                  }`}
                >
                  <div className="p-md rounded-full bg-primary/10 text-primary mb-sm">
                    <Upload size={28} />
                  </div>

                  <p className="text-small font-semibold text-on-surface">
                    {isUploadingFile
                      ? "Uploading document to server..."
                      : "Drag & drop your document here, or click to browse"}
                  </p>

                  <p className="text-caption text-on-surface-variant mt-1 max-w-sm">
                    Supported file formats: PDF, DOCX, PPTX, XLSX, TXT (Maximum file size: 15MB)
                  </p>

                  <label className="mt-md cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.pptx,.xlsx,.txt"
                      disabled={isUploadingFile}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileChange(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isUploadingFile}
                      loading={isUploadingFile}
                      className="pointer-events-none"
                    >
                      {isUploadingFile ? "Uploading..." : "Select Document"}
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="p-md rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-md">
                  <div className="flex items-center gap-md truncate">
                    <div className="p-xs rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div className="truncate">
                      <p className="text-small font-semibold text-on-surface truncate">
                        {uploadedFile.originalname}
                      </p>
                      <p className="text-caption text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Uploaded ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileError(null);
                    }}
                    className="shrink-0 text-error hover:bg-error-container p-2"
                    title="Remove and upload different file"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}

              {fileError && (
                <div className="flex items-center gap-xs text-caption text-error mt-1">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-sm border-t border-outline-variant pt-lg">
            <Link href="/student/case-studies" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmittingForm || isUploadingFile}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmittingForm}
              disabled={isSubmittingForm || isUploadingFile || !uploadedFile}
              className="w-full sm:w-auto gap-xs"
            >
              <CheckCircle2 size={16} />
              Submit Case Study
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
