"use client";

import { useEffect, useState } from "react";
import { Menu, X, Users } from "lucide-react";
import ToastButton from "/src/components/marketing/ToastButton";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#learning-models", label: "Learning models" },
  { href: "#about", label: "About" },
];

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/80 shadow-sm backdrop-blur-md dark:border-outline/20">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-xl py-md">
        <a
          href="#"
          className="flex items-center gap-sm text-h2 font-bold text-primary dark:text-on-primary-container"
        >
          <Users size={24} aria-hidden="true" />
          CaseNest
        </a>

        <div className="hidden items-center gap-xl md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-on-surface-variant transition-colors duration-200 hover:text-primary dark:hover:text-on-primary-container"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-md">
          <ToastButton variant="secondary" size="sm" className="hidden md:inline-flex">
            Log in
          </ToastButton>
          <button
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
            className="text-on-surface-variant md:hidden"
          >
            {drawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="flex flex-col gap-lg border-t border-outline-variant/30 bg-surface px-xl py-lg md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="text-on-surface-variant transition-colors duration-200 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <ToastButton variant="secondary" size="sm">
            Log in
          </ToastButton>
        </div>
      )}
    </nav>
  );
}
