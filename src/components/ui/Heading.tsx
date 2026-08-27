import type { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "/src/components/ui/Button";

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4";

const SIZE_CLASSES: Record<HeadingSize, string> = {
  display: "text-display",
  // Only h1 has a dedicated mobile size in the Phase 0b type scale.
  h1: "text-h1-mobile md:text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

function defaultSizeForTag(tag: HeadingTag): HeadingSize {
  return tag === "h5" || tag === "h6" ? "h4" : tag;
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic tag — pick based on document outline, not visual size. */
  as: HeadingTag;
  /** Visual size — defaults to match `as`. Set explicitly to decouple
   *  appearance from semantics (e.g. an h2 that should look like an h4). */
  size?: HeadingSize;
  children: ReactNode;
}

export function Heading({ as: Tag, size, className, children, ...props }: HeadingProps) {
  return (
    <Tag
      className={twMerge(SIZE_CLASSES[size ?? defaultSizeForTag(Tag)], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Heading;
