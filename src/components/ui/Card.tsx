import type { HTMLAttributes } from "react";
import { twMerge } from "/src/components/ui/Button";

export type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "",
  sm: "p-md",
  md: "p-lg",
  lg: "p-xl",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: boolean;
  interactive?: boolean;
}

export function Card({
  padding = "md",
  shadow = true,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        "bg-surface-container-low border border-outline-variant rounded-xl",
        shadow && "shadow-sm",
        PADDING_CLASSES[padding],
        interactive &&
          "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-l-2 hover:border-l-primary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
