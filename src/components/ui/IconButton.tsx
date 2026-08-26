import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  BUTTON_VARIANT_CLASSES,
  Spinner,
  twMerge,
  type ButtonSize,
  type ButtonVariant,
} from "/src/components/ui/Button";

const ICON_BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-11 w-11",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        disabled={disabled || loading}
        className={twMerge(
          "inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          BUTTON_VARIANT_CLASSES[variant],
          ICON_BUTTON_SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading ? <Spinner /> : icon}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

export default IconButton;
