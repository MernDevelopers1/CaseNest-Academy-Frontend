"use client";

import { useSyncExternalStore } from "react";
import { Sun, Monitor, Moon } from "lucide-react";
import {
  applyTheme,
  getPref,
  subscribeToThemePref,
  type ThemePref,
} from "/src/lib/theme";

const OPTIONS: { pref: ThemePref; label: string; icon: typeof Sun }[] = [
  { pref: "light", label: "Light", icon: Sun },
  { pref: "system", label: "System", icon: Monitor },
  { pref: "dark", label: "Dark", icon: Moon },
];

const getServerSnapshot = () => null;

export default function ThemeToggle() {
  const current = useSyncExternalStore(
    subscribeToThemePref,
    getPref,
    getServerSnapshot,
  );

  return (
    <div className="inline-flex items-center gap-xs rounded-full border border-outline bg-surface-container p-xs">
      {OPTIONS.map(({ pref, label, icon: Icon }) => {
        const isActive = current === pref;
        return (
          <button
            key={pref}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => applyTheme(pref)}
            className={
              isActive
                ? "flex items-center gap-xs rounded-full bg-primary text-on-primary-container px-md py-xs text-small"
                : "flex items-center gap-xs rounded-full px-md py-xs text-small text-on-surface-variant hover:text-on-surface"
            }
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
