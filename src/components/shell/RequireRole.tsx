"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthContext } from "/src/components/AuthProvider";
import { useToast } from "/src/components/ui/Toast";
import { useMounted } from "/src/lib/useMounted";
import type { Role } from "/src/components/auth/roles";

export interface RequireRoleProps {
  expectedRole: Role;
  children: ReactNode;
}

export default function RequireRole({
  expectedRole,
  children,
}: RequireRoleProps) {
  const mounted = useMounted();
  const { user, role } = useAuthContext();
  const router = useRouter();
  const { showToast } = useToast();

  const authorized = mounted && !!user && role === expectedRole;

  useEffect(() => {
    // Wait for the client snapshot to hydrate (see useMounted) — before
    // that, `user` is always null (the SSR-matching value), which would
    // otherwise look identical to "genuinely logged out" and redirect an
    // already-logged-in user for one frame.
    if (!mounted) return;

    if (!user) {
      router.replace(`/login/${expectedRole}`);
      return;
    }
    if (role !== expectedRole) {
      showToast({
        variant: "error",
        message: "You don't have access to that portal.",
      });
      router.replace("/");
    }
  }, [mounted, user, role, expectedRole, router, showToast]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
