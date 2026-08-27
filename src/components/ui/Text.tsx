import type { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "/src/components/ui/Button";

export type TextTag = "p" | "span" | "div" | "label";
export type TextSize = "body" | "small" | "caption";

const SIZE_CLASSES: Record<TextSize, string> = {
  body: "text-body",
  small: "text-small",
  caption: "text-caption",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextTag;
  size?: TextSize;
  children: ReactNode;
}

export function Text({
  as: Tag = "p",
  size = "body",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={twMerge(SIZE_CLASSES[size], className)} {...props}>
      {children}
    </Tag>
  );
}

export default Text;
