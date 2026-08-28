"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, FileText, MessagesSquare } from "lucide-react";
import RequireRole from "/src/components/shell/RequireRole";
import AppShell from "/src/components/shell/AppShell";
import type { NavItem } from "/src/components/shell/AppShell";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/tutor", icon: LayoutDashboard },
  { label: "Case Studies", href: "/tutor/case-studies", icon: FileText },
  { label: "Discussions", href: "/tutor/discussions", icon: MessagesSquare },
];

export default function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole expectedRole="tutor">
      <AppShell role="tutor" navItems={NAV_ITEMS}>
        {children}
      </AppShell>
    </RequireRole>
  );
}
