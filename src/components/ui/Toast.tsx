"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import IconButton from "/src/components/ui/IconButton";
import Card from "/src/components/ui/Card";
import { twMerge } from "/src/components/ui/Button";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: { message: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    border: "border-l-success",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  error: { border: "border-l-error", icon: XCircle, iconColor: "text-error" },
  warning: {
    border: "border-l-warning",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  info: { border: "border-l-secondary", icon: Info, iconColor: "text-secondary" },
};

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message,
      variant = "info",
    }: {
      message: string;
      variant?: ToastVariant;
    }) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-sm p-md md:inset-x-auto md:right-0 md:max-w-sm"
      >
        {toasts.map((toast) => {
          const { border, icon: Icon, iconColor } =
            VARIANT_STYLES[toast.variant];
          return (
            <Card
              key={toast.id}
              padding="sm"
              className={twMerge(
                "flex items-start gap-sm border-l-4",
                border,
              )}
            >
              <Icon
                size={18}
                className={twMerge("mt-0.5 shrink-0", iconColor)}
              />
              <p className="flex-1 text-small text-on-surface">
                {toast.message}
              </p>
              <IconButton
                label="Dismiss"
                icon={<X size={14} />}
                variant="secondary"
                size="sm"
                onClick={() => dismissToast(toast.id)}
              />
            </Card>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
