"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Menu, X, School, Plus, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ThemeToggle from "/src/components/ui/ThemeToggle";
import AvatarMenu from "/src/components/shell/AvatarMenu";
import PortalFooter from "/src/components/shell/PortalFooter";
import { twMerge } from "/src/components/ui/Button";
import type { Role } from "/src/components/auth/roles";
import { useAuthContext } from "/src/components/AuthProvider";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AppShellProps {
  role: Role;
  navItems: NavItem[];
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

function BrandHeader({ role }: { role: Role }) {
  return (
    <Link href={`/${role}`} className="flex min-w-0 flex-1 items-center gap-sm p-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
        <School size={20} className="text-on-primary" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-h3 font-black text-primary">CaseNest Academy</span>
        <span className="truncate text-caption text-on-surface-variant">
          Collaborative Learning
        </span>
      </div>
    </Link>
  );
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
    <nav className="flex flex-1 flex-col gap-sm overflow-y-auto px-md py-sm">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={twMerge(
              "flex items-center gap-sm rounded-lg p-sm text-body transition-all active:scale-[0.98]",
              active
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:translate-x-1 hover:bg-surface-container",
            )}
          >
            <Icon size={20} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const { logout } = useAuthContext();
  const router = useRouter();

  function handleLogout() {
    logout();
    onNavigate?.();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-sm border-t border-outline-variant p-md">
      <Link
        href={`/${role}/profile`}
        onClick={onNavigate}
        className="flex items-center gap-sm rounded-lg p-sm text-body text-on-surface-variant transition-all hover:translate-x-1 hover:bg-surface-container"
      >
        <Settings size={20} className="shrink-0" />
        Settings
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-sm rounded-lg p-sm text-left text-body text-on-surface-variant transition-all hover:translate-x-1 hover:bg-surface-container"
      >
        <LogOut size={20} className="shrink-0" />
        Logout
      </button>
    </div>
  );
}

function SidebarContents({
  role,
  navItems,
  ctaLabel,
  ctaHref,
  onNavigate,
  onClose,
}: {
  role: Role;
  navItems: NavItem[];
  ctaLabel: string;
  ctaHref: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center">
        <BrandHeader role={role} />
        {onClose && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="mr-md shrink-0 rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <X size={22} />
          </button>
        )}
      </div>
      <div className="mb-sm px-md">
        <Link
          href={ctaHref}
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-xs rounded-lg bg-primary py-sm text-small text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary-container"
        >
          <Plus size={18} />
          {ctaLabel}
        </Link>
      </div>
      <SidebarNav navItems={navItems} pathname={usePathname()} onNavigate={onNavigate} />
      <SidebarFooter role={role} onNavigate={onNavigate} />
    </>
  );
}

export default function AppShell({
  role,
  navItems,
  children,
  ctaLabel = "Create Session",
  ctaHref,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const resolvedCtaHref = ctaHref ?? `/${role}`;

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
        <SidebarContents
          role={role}
          navItems={navItems}
          ctaLabel={ctaLabel}
          ctaHref={resolvedCtaHref}
        />
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
            <SidebarContents
              role={role}
              navItems={navItems}
              ctaLabel={ctaLabel}
              ctaHref={resolvedCtaHref}
              onNavigate={() => setDrawerOpen(false)}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-xl">
          <div className="flex items-center gap-sm lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full p-xs text-primary transition-colors hover:bg-surface-container"
            >
              <Menu size={24} />
            </button>
            <span className="text-h3 font-bold text-primary">CaseNest</span>
          </div>
          <div className="hidden flex-1 lg:block" />
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-xs">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-sm text-on-surface-variant transition-colors duration-200 hover:bg-surface-container active:scale-95"
              >
                <Bell size={20} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
              </button>
              <button
                type="button"
                aria-label="Help"
                className="hidden rounded-full p-sm text-on-surface-variant transition-colors duration-200 hover:bg-surface-container active:scale-95 sm:block"
              >
                <HelpCircle size={20} />
              </button>
            </div>
            <ThemeToggle />
            <AvatarMenu />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto bg-surface-bright">
          <div className="flex flex-1 flex-col gap-lg p-lg md:p-xl lg:p-2xl">{children}</div>
          <PortalFooter />
        </main>
      </div>
    </div>
  );
}
