"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IconButton from "/src/components/ui/IconButton";
import { twMerge } from "/src/components/ui/Button";
import { useMounted } from "/src/lib/useMounted";

export type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  /** Extra classes for the panel — e.g. to widen past the "lg" preset. */
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg">
      <div
        className="absolute inset-0 bg-inverse-surface/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={twMerge(
          "relative flex w-full flex-col gap-lg rounded-2xl bg-surface p-xl shadow-lg outline-none max-h-[90vh] overflow-y-auto",
          SIZE_CLASSES[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-md">
          <h3 id={titleId} className="text-h3 text-on-surface">
            {title}
          </h3>
          <IconButton
            label="Close"
            icon={<X size={18} />}
            variant="secondary"
            size="sm"
            onClick={onClose}
          />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
