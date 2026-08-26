import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { twMerge } from "/src/components/ui/Button";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, required, helper, error, id, className, disabled, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = error || helper ? `${inputId}-message` : undefined;

    return (
      <div className="flex flex-col gap-xs">
        {label && (
          <label
            htmlFor={inputId}
            className="text-caption text-on-surface-variant"
          >
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={messageId}
          className={twMerge(
            "h-12 w-full rounded-lg border bg-surface px-md text-body text-on-surface outline-none transition-colors placeholder:text-outline-variant disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60",
            error
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
            className,
          )}
          {...props}
        />
        {(error || helper) && (
          <p
            id={messageId}
            className={twMerge(
              "text-caption",
              error ? "text-error" : "text-on-surface-variant",
            )}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
