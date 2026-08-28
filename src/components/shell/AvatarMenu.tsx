"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, KeyRound, LogOut } from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";

export default function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, role, logout } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/");
  }

  const displayName = getUserDisplayName(user) ?? "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-small font-semibold text-on-primary-container transition-opacity hover:opacity-90"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-xs w-56 rounded-lg border border-outline-variant bg-surface p-xs shadow-lg"
        >
          <div className="border-b border-outline-variant px-md py-sm">
            <p className="truncate text-small font-semibold text-on-surface">
              {displayName}
            </p>
            <p className="text-caption capitalize text-on-surface-variant">
              {role}
            </p>
          </div>
          <Link
            href={`/${role}/profile`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-sm rounded-lg px-md py-sm text-small text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <User size={16} />
            Profile
          </Link>
          <Link
            href={`/${role}/change-password`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-sm rounded-lg px-md py-sm text-small text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <KeyRound size={16} />
            Change Password
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-sm rounded-lg px-md py-sm text-left text-small text-error hover:bg-error-container/20"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
