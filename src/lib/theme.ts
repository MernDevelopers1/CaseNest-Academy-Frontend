export type ThemePref = "light" | "dark" | "system";

// Kept in sync with the inline no-flash script in app/layout.tsx, which
// duplicates this key literally since it runs before any module loads.
const STORAGE_KEY = "casenest-theme";

function isThemePref(value: string | null): value is ThemePref {
  return value === "light" || value === "dark" || value === "system";
}

export function getPref(): ThemePref {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isThemePref(stored) ? stored : "system";
}

export function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyClass(resolved: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

// Lets ThemeToggle re-render on preference changes via useSyncExternalStore
// instead of setState-in-effect.
const listeners = new Set<() => void>();

export function subscribeToThemePref(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyTheme(pref: ThemePref): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, pref);
  applyClass(resolve(pref));
  listeners.forEach((listener) => listener());
}

export function initTheme(): () => void {
  if (typeof window === "undefined") return () => {};

  const pref = getPref();
  applyClass(resolve(pref));

  if (pref !== "system") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => applyClass(resolve("system"));
  media.addEventListener("change", handleChange);
  return () => media.removeEventListener("change", handleChange);
}
