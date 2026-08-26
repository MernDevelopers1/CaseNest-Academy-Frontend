import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge doesn't know our Phase 0b text-* size scale (text-body,
// text-caption, etc.), so by default it lumps them into the text-color
// group and silently drops one of the two whenever a size and a color
// class appear together (e.g. "text-body text-on-surface" loses text-body).
// This teaches it the real group so both survive.
export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h1-mobile",
        "text-h2",
        "text-h3",
        "text-h4",
        "text-body",
        "text-small",
        "text-caption",
      ],
    },
  },
});

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary/90",
  secondary: "border border-outline text-primary hover:bg-primary/8",
  danger: "bg-error text-on-error hover:bg-error/90",
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-11 px-md text-small gap-xs",
  md: "h-12 px-lg text-body gap-sm",
  lg: "h-14 px-xl text-body gap-sm",
};

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={twMerge("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          BUTTON_VARIANT_CLASSES[variant],
          BUTTON_SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
