"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { twMerge } from "/src/components/ui/Button";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string; icon: number }> = {
  sm: { container: "w-8 h-8", text: "text-caption", icon: 16 },
  md: { container: "w-10 h-10", text: "text-small", icon: 20 },
  lg: { container: "w-12 h-12", text: "text-body", icon: 24 },
  xl: { container: "w-16 h-16", text: "text-h4", icon: 32 },
};

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = "md",
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeCfg = SIZE_CLASSES[size];

  const imageUrl = src
    ? src.startsWith("http://") || src.startsWith("https://")
      ? src
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${src.startsWith("/") ? "" : "/"}${src}`
    : null;

  const initials = (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (imageUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={imageUrl}
        alt={name || "User Avatar"}
        onError={() => setImgError(true)}
        className={twMerge(
          "rounded-full object-cover border border-outline-variant bg-surface-container",
          sizeCfg.container,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={twMerge(
        "rounded-full flex items-center justify-center font-bold bg-primary-container text-on-primary-container border border-outline-variant select-none",
        sizeCfg.container,
        sizeCfg.text,
        className,
      )}
      aria-label={name || "User Avatar"}
    >
      {initials ? initials : <User size={sizeCfg.icon} className="opacity-70" />}
    </div>
  );
}
