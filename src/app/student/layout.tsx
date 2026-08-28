"use client";

import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  Star,
} from "lucide-react";
import RequireRole from "/src/components/shell/RequireRole";
import AppShell from "/src/components/shell/AppShell";
import type { NavItem } from "/src/components/shell/AppShell";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Case Studies", href: "/student/case-studies", icon: FileText },
  { label: "Submit Case Study", href: "/student/submit", icon: Upload },
  { label: "Discussion", href: "/student/discussion", icon: MessageSquare },
  { label: "Feedback", href: "/student/feedback", icon: Star },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole expectedRole="student">
      <AppShell role="student" navItems={NAV_ITEMS}>
        {children}
      </AppShell>
    </RequireRole>
  );
}
