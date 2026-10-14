"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Loader2, Sparkles } from "lucide-react";
import Modal from "/src/components/ui/Modal";
import Button from "/src/components/ui/Button";
import Input from "/src/components/ui/Input";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import type { Session } from "/src/lib/sessionTypes";

export interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  session?: Session | null;
  onSuccess?: () => void;
}

const COMMON_FIELDS = [
  "Lecture",
  "Seminar",
  "Workshop",
  "Case Study",
  "Lab Practical",
  "Research",
];

function parseInitialFields(fieldsStr?: string | null): string[] {
  if (!fieldsStr) return ["Lecture"];
  try {
    const parsed = JSON.parse(fieldsStr);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") return [parsed];
  } catch {
    return fieldsStr.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["Lecture"];
}

interface FormContentProps {
  session?: Session | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function SessionFormContent({ session, onClose, onSuccess }: FormContentProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const isEdit = Boolean(session?.SessionId);
  const currentYear = new Date().getFullYear();

  const [sessionName, setSessionName] = useState(session?.SessionName || "");
  const [sessionYear, setSessionYear] = useState(session?.SessionYear || String(currentYear));
  const [selectedFields, setSelectedFields] = useState<string[]>(() =>
    parseInitialFields(session?.SessionFields),
  );
  const [customFieldInput, setCustomFieldInput] = useState("");
  const [countryCheck, setCountryCheck] = useState(Boolean(session?.CountryCheck));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const addCustomField = () => {
    const trimmed = customFieldInput.trim();
    if (trimmed && !selectedFields.includes(trimmed)) {
      setSelectedFields((prev) => [...prev, trimmed]);
      setCustomFieldInput("");
    }
  };

  const sessionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        SessionName: sessionName.trim(),
        SessionYear: sessionYear.trim(),
        Fields: JSON.stringify(selectedFields),
        CountryCheck: countryCheck ? 1 : 0,
        codeModified: true,
      };

      if (isEdit && session?.SessionId) {
        return apiFetch<Session[]>("/AddSession", {
          method: "PATCH",
          body: JSON.stringify({
            SessionId: session.SessionId,
            ...payload,
          }),
        });
      }

      return apiFetch<Session[]>("/AddSession", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showToast({
        variant: "success",
        message: isEdit ? "Session updated successfully." : "New session created successfully.",
      });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 403 || String(err.body).toLowerCase().includes("exist")) {
          setErrorMessage(
            "A session with this name / code already exists for the selected academic year. Please choose a unique name.",
          );
          return;
        }
        setErrorMessage(typeof err.body === "string" ? err.body : "Failed to save session.");
      } else {
        setErrorMessage("An unexpected error occurred while saving the session.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      setErrorMessage("Please enter a session name or code.");
      return;
    }
    if (!sessionYear.trim()) {
      setErrorMessage("Please select or enter an academic year.");
      return;
    }
    setErrorMessage(null);
    sessionMutation.mutate();
  };

  const yearOptions = [
    currentYear + 1,
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      {/* Inline Error State matching Stitch */}
      {errorMessage && (
        <div className="bg-error-container text-on-error-container p-md rounded-xl flex items-start gap-sm border border-error/20">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <p className="text-small font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        {/* Session Name/Code */}
        <div className="sm:col-span-2">
          <label className="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
            Session Name / Code <span className="text-error">*</span>
          </label>
          <Input
            value={sessionName}
            onChange={(e) => {
              setSessionName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. Advanced Physics 101 or PHY-400A"
            required
          />
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
            Academic Year <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value={sessionYear}
              onChange={(e) => setSessionYear(e.target.value)}
              className="w-full h-11 px-md rounded-xl bg-surface-bright border border-outline/30 text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
              ▾
            </div>
          </div>
        </div>

        {/* Session Fields / Types Picker */}
        <div className="sm:col-span-2">
          <label className="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
            Session Tags & Types
          </label>
          <div className="flex flex-wrap gap-xs mb-sm">
            {COMMON_FIELDS.map((field) => {
              const isSelected = selectedFields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  className={`inline-flex items-center gap-xs px-md py-xs rounded-full text-small font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {field}
                </button>
              );
            })}
          </div>

          {/* Custom Field Add */}
          <div className="flex gap-xs">
            <Input
              value={customFieldInput}
              onChange={(e) => setCustomFieldInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomField();
                }
              }}
              placeholder="Add custom tag (press Enter)"
              className="text-small"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCustomField}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Country Check Toggle */}
      <div className="flex items-center justify-between p-md border border-outline/20 rounded-xl bg-surface-container-low transition-colors">
        <div>
          <h4 className="text-body font-semibold text-on-surface flex items-center gap-xs">
            <Sparkles className="w-4 h-4 text-secondary" />
            Country Verification Check
          </h4>
          <p className="text-caption text-on-surface-variant">
            Enforce geographical access checks during session login.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={countryCheck}
            onChange={(e) => setCountryCheck(e.target.checked)}
          />
          <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-sm pt-md border-t border-outline/10">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={sessionMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={sessionMutation.isPending}
        >
          {sessionMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-xs" />
              Saving...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Session"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SessionModal({
  open,
  onClose,
  session,
  onSuccess,
}: SessionModalProps) {
  const isEdit = Boolean(session?.SessionId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Session" : "Add New Session"}
      size="lg"
    >
      {open && (
        <SessionFormContent
          key={session?.SessionId ? String(session.SessionId) : "new-session"}
          session={session}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
