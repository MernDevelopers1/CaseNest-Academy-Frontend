"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Menu, X, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ThemeToggle from "/src/components/ui/ThemeToggle";
import AvatarMenu from "/src/components/shell/AvatarMenu";
import { twMerge } from "/src/components/ui/Button";
import type { Role } from "/src/components/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AppShellProps {
  role: Role;
  navItems: NavItem[];
  children: ReactNode;
}

function SidebarNav({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-xs px-md py-md">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={twMerge(
              "flex items-center gap-sm rounded-lg px-md py-sm text-body transition-colors",
              active
                ? "bg-primary/8 text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ role, navItems, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-r lg:border-outline-variant lg:bg-surface-container-low">
        <Link
          href={`/${role}`}
          className="flex items-center gap-sm px-lg py-lg text-h4 font-bold text-primary"
        >
          <Users size={22} aria-hidden="true" />
          CaseNest
        </Link>
        <SidebarNav navItems={navItems} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-inverse-surface/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-surface-container-low shadow-lg">
            <div className="flex items-center justify-between px-lg py-lg">
              <Link
                href={`/${role}`}
                className="flex items-center gap-sm text-h4 font-bold text-primary"
                onClick={() => setDrawerOpen(false)}
              >
                <Users size={22} aria-hidden="true" />
                CaseNest
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="text-on-surface-variant"
              >
                <X size={22} />
              </button>
            </div>
            <SidebarNav
              navItems={navItems}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-outline-variant bg-surface px-lg py-md">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="text-on-surface-variant lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-1 items-center justify-end gap-md">
            <ThemeToggle />
            <AvatarMenu />
          </div>
        </header>

        <main className="flex-1 p-xl">{children}</main>
      </div>
    </div>
  );
}
