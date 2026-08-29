"use client";

import type { ReactNode } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react";
import RequireRole from "/src/components/shell/RequireRole";
import AppShell from "/src/components/shell/AppShell";
import type { NavItem } from "/src/components/shell/AppShell";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Tutors", href: "/admin/tutors", icon: GraduationCap },
  { label: "Manage Students", href: "/admin/students", icon: Users },
  { label: "Sessions", href: "/admin/sessions", icon: Calendar },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole expectedRole="admin">
      <AppShell role="admin" navItems={NAV_ITEMS} ctaHref="/admin/sessions">
        {children}
      </AppShell>
    </RequireRole>
  );
}
