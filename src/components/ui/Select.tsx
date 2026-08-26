import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "/src/components/ui/Button";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      required,
      helper,
      error,
      options,
      placeholder,
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const messageId = error || helper ? `${selectId}-message` : undefined;

    return (
      <div className="flex flex-col gap-xs">
        {label && (
          <label
            htmlFor={selectId}
            className="text-caption text-on-surface-variant"
          >
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={messageId}
            className={twMerge(
              "h-12 w-full appearance-none rounded-lg border bg-surface px-md pr-3xl text-body text-on-surface outline-none transition-colors disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60",
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-md top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          />
        </div>
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
Select.displayName = "Select";

export default Select;
