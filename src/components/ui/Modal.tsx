"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IconButton from "/src/components/ui/IconButton";
import { twMerge } from "/src/components/ui/Button";

export type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const noopSubscribe = () => () => {};

// The portal target (document.body) only exists client-side. This mirrors
// React's own "useIsClient" pattern to detect that without a
// setState-in-effect (which the react-hooks lint rule now flags).
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
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
