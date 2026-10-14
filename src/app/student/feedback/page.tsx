"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Star,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Send,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserId, getUserDisplayName } from "/src/lib/user";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import { Input } from "/src/components/ui/Input";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";

const feedbackSchema = z.object({
  Gender: z.string().min(1, "Please select your gender"),
  Age: z.string().min(1, "Please select your age bracket"),
  Experience: z
    .string()
    .min(1, "Please specify years of professional experience (enter 0 if none)"),
  EducationYears: z
    .string()
    .min(1, "Please specify years of formal education (e.g. 16 for Bachelor's)"),
  SectorExperiance: z
    .string()
    .min(2, "Please specify your industry or sector of experience"),
  geoLocation: z
    .string()
    .min(2, "Please enter the geographic location referring to in your case study"),
  UseExpBefore: z.string().min(1, "Please select an answer"),
  Usefull: z.string().min(1, "Please rate the usefulness"),
  OwnBackExpUnderstandingStratMang: z.string().min(1, "Please select an answer"),
  UnderstandingSM: z.string().min(1, "Please select an answer"),
  ExpInYourLearn: z
    .string()
    .min(5, "Please provide your perspective (minimum 5 characters)"),
  BackExpInClass: z
    .string()
    .min(3, "Please share your reflection"),
  LearnFromOther: z
    .string()
    .min(5, "Please share how you learned from others (minimum 5 characters)"),
  ImprovedInFuture: z.string().optional(),
  AnyOtherComment: z.string().optional(),
  Permission: z
    .boolean()
    .refine((val) => val === true, "Consent is required for anonymous research usage"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const AGE_OPTIONS = [
  { value: "20-25", label: "20 to 25" },
  { value: "26-30", label: "26 to 30" },
  { value: "31-35", label: "31 to 35" },
  { value: "36-40", label: "36 to 40" },
  { value: "41-50", label: "41 to 50" },
  { value: "50+", label: "Over 50" },
];

const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const USEFUL_OPTIONS = [
  { value: "Extremely Useful", label: "Extremely Useful" },
  { value: "Very Useful", label: "Very Useful" },
  { value: "Moderately Useful", label: "Moderately Useful" },
  { value: "Slightly Useful", label: "Slightly Useful" },
  { value: "Not Useful", label: "Not Useful" },
];

const AGREEMENT_OPTIONS = [
  { value: "Strongly Agree", label: "Strongly Agree" },
  { value: "Agree", label: "Agree" },
  { value: "Neutral", label: "Neutral" },
  { value: "Disagree", label: "Disagree" },
];

export default function StudentFeedbackPage() {
  const { user } = useAuthContext();
  const userId = getUserId(user);
  const name = getUserDisplayName(user);
  const { showToast } = useToast();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      Gender: "",
      Age: "",
      Experience: "",
      EducationYears: "",
      SectorExperiance: "",
      geoLocation: "",
      UseExpBefore: "",
      Usefull: "",
      OwnBackExpUnderstandingStratMang: "",
      UnderstandingSM: "",
      ExpInYourLearn: "",
      BackExpInClass: "",
      LearnFromOther: "",
      ImprovedInFuture: "",
      AnyOtherComment: "",
      Permission: false,
    },
  });

  const onSubmit = async (values: FeedbackFormData) => {
    if (!userId) {
      showToast({
        variant: "error",
        message: "You must be logged in as a student to submit feedback.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      UserId: userId,
      Gender: values.Gender,
      Age: values.Age,
      Experience: String(values.Experience).trim(),
      EducationYears: String(values.EducationYears).trim(),
      SectorExperiance: values.SectorExperiance.trim(),
      geoLocation: values.geoLocation.trim(),
      UseExpBefore: values.UseExpBefore,
      Usefull: values.Usefull,
      OwnBackExpUnderstandingStratMang: values.OwnBackExpUnderstandingStratMang,
      UnderstandingSM: values.UnderstandingSM,
      ExpInYourLearn: values.ExpInYourLearn.trim(),
      BackExpInClass: values.BackExpInClass.trim(),
      LearnFromOther: values.LearnFromOther.trim(),
      ImprovedInFuture: (values.ImprovedInFuture || "").trim(),
      AnyOtherComment: (values.AnyOtherComment || "").trim(),
      Permission: "Granted",
    };

    try {
      await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
      showToast({
        variant: "success",
        message: "Thank you! Your feedback has been recorded.",
      });
    } catch (err) {
      console.error("Feedback error:", err);
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to submit feedback. Please check required fields.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-3xl px-md text-center">
        <div className="p-xl rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-lg">
          <CheckCircle2 size={56} />
        </div>
        <Heading as="h1" size="h2" className="text-on-surface">
          Feedback Submitted!
        </Heading>
        <p className="mt-sm text-small text-on-surface-variant leading-relaxed">
          Thank you for sharing your learning reflections, {name || "Student"}. Your evaluation
          helps improve collaborative peer case study sessions for future cohorts.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-sm mt-xl">
          <Link href="/student">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setIsSubmitted(false);
              reset();
            }}
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl max-w-4xl mx-auto pb-3xl">
      {/* Top Header */}
      <div className="flex flex-col gap-xs border-b border-outline-variant pb-lg">
        <Link
          href="/student"
          className="text-caption font-medium text-primary hover:underline flex items-center gap-xs w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-xs">
          <Heading as="h1" size="h2" className="text-on-surface">
            Course Evaluation & Feedback
          </Heading>
        </div>
        <p className="text-small text-on-surface-variant">
          Help us evaluate the peer-learning case study pedagogy and how drawing on personal professional backgrounds impacts strategic management understanding.
        </p>
      </div>

      <Card className="p-xl border border-outline-variant bg-surface">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2xl">
          {/* Section 1: Demographics & Background */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <Sparkles size={16} />
              <span>Section 1: Background & Demographics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Gender */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Gender <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-xs">
                  {GENDER_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs p-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-small text-on-surface"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("Gender")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.Gender && (
                  <p className="text-caption text-error">{errors.Gender.message}</p>
                )}
              </div>

              {/* Age */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Age Bracket <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-3 gap-xs">
                  {AGE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs p-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-small text-on-surface"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("Age")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.Age && (
                  <p className="text-caption text-error">{errors.Age.message}</p>
                )}
              </div>

              {/* Experience (Years) */}
              <div>
                <Input
                  label="Years of Professional Experience"
                  required
                  placeholder="e.g. 3 (enter 0 if none)"
                  error={errors.Experience?.message}
                  {...register("Experience")}
                />
              </div>

              {/* Formal Education (Years) */}
              <div>
                <Input
                  label="Years of Formal Education"
                  required
                  placeholder="e.g. 16 (including your Master's programme)"
                  error={errors.EducationYears?.message}
                  {...register("EducationYears")}
                />
              </div>

              {/* Sector of Experience */}
              <div>
                <Input
                  label="Sector of Professional Experience"
                  required
                  placeholder="e.g. Financial Services, Manufacturing, Tech"
                  error={errors.SectorExperiance?.message}
                  {...register("SectorExperiance")}
                />
              </div>

              {/* Geographical Location */}
              <div>
                <Input
                  label="Geographical Location (Referring to in Case Study)"
                  required
                  placeholder="e.g. United Kingdom, South Asia, Global"
                  error={errors.geoLocation?.message}
                  {...register("geoLocation")}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Learning Experience Ratings */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <Star size={16} />
              <span>Section 2: Learning Experience Reflections</span>
            </div>

            <div className="flex flex-col gap-xl">
              {/* Question 1: Use background experience before */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Have you ever used your background experience in a classroom learning experience before? <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-md">
                  {YES_NO_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs px-md py-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-small text-on-surface"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("UseExpBefore")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.UseExpBefore && (
                  <p className="text-caption text-error">{errors.UseExpBefore.message}</p>
                )}
              </div>

              {/* Question 2: Did you find it useful? */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Did you find using background experiences useful in this course? <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-xs">
                  {USEFUL_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs p-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-caption text-on-surface text-center justify-center"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("Usefull")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.Usefull && (
                  <p className="text-caption text-error">{errors.Usefull.message}</p>
                )}
              </div>

              {/* Question 3: Understanding of SM */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Did this session improve your understanding of topics related to Strategic Management? <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs">
                  {AGREEMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs p-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-small text-on-surface text-center justify-center"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("UnderstandingSM")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.UnderstandingSM && (
                  <p className="text-caption text-error">{errors.UnderstandingSM.message}</p>
                )}
              </div>

              {/* Question 4: Own background experience helped */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Did using your own background experience help you understand Strategic Management better? <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs">
                  {AGREEMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-xs p-sm rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer text-small text-on-surface text-center justify-center"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("OwnBackExpUnderstandingStratMang")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.OwnBackExpUnderstandingStratMang && (
                  <p className="text-caption text-error">{errors.OwnBackExpUnderstandingStratMang.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Open Reflections */}
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-xs text-primary font-semibold text-small border-b border-outline-variant pb-xs">
              <HelpCircle size={16} />
              <span>Section 3: Detailed Reflections</span>
            </div>

            <div className="flex flex-col gap-lg">
              {/* ExpInYourLearn */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Would you like to build your experience into your learning on the course more? Please give reasons. <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full rounded-lg border bg-surface p-md text-small text-on-surface outline-none transition-colors ${
                    errors.ExpInYourLearn
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Share your thoughts on applying lived experience..."
                  {...register("ExpInYourLearn")}
                />
                {errors.ExpInYourLearn && (
                  <p className="text-caption text-error">{errors.ExpInYourLearn.message}</p>
                )}
              </div>

              {/* BackExpInClass */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Did you like talking about your background experience in the classroom/discussion? <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full rounded-lg border bg-surface p-md text-small text-on-surface outline-none transition-colors ${
                    errors.BackExpInClass
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Describe your classroom or peer discussion comfort level..."
                  {...register("BackExpInClass")}
                />
                {errors.BackExpInClass && (
                  <p className="text-caption text-error">{errors.BackExpInClass.message}</p>
                )}
              </div>

              {/* LearnFromOther */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Did you learn from other people and their background experiences? If so, how? <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full rounded-lg border bg-surface p-md text-small text-on-surface outline-none transition-colors ${
                    errors.LearnFromOther
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Reflect on peer insights gained..."
                  {...register("LearnFromOther")}
                />
                {errors.LearnFromOther && (
                  <p className="text-caption text-error">{errors.LearnFromOther.message}</p>
                )}
              </div>

              {/* ImprovedInFuture */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Which aspect(s) do you think could be improved for future cohorts? (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant bg-surface p-md text-small text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="Suggestions for session timing, structure, or guidelines..."
                  {...register("ImprovedInFuture")}
                />
              </div>

              {/* AnyOtherComment */}
              <div className="flex flex-col gap-xs">
                <label className="text-caption text-on-surface-variant font-medium">
                  Any other comments or feedback you would like to share (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-outline-variant bg-surface p-md text-small text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="Additional reflections..."
                  {...register("AnyOtherComment")}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Consent & Research Permission */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-lg flex flex-col gap-sm">
            <div className="flex items-start gap-sm">
              <Controller
                name="Permission"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="consent-permission"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
                  />
                )}
              />
              <label
                htmlFor="consent-permission"
                className="text-small text-on-surface cursor-pointer select-none leading-relaxed"
              >
                <strong>Research Consent:</strong> Your responses and submitted cases will be used
                anonymously for pedagogical research and academic publication purposes. Please tick here
                to grant consent for your comments and evaluations to be used anonymously. <span className="text-error">*</span>
              </label>
            </div>
            {errors.Permission && (
              <p className="text-caption text-error pl-6">
                {errors.Permission.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-sm border-t border-outline-variant pt-lg">
            <Link href="/student" className="w-full sm:w-auto">
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
              <Send size={15} />
              Submit Course Feedback
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
