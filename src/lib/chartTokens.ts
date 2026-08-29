"use client";

import { useSyncExternalStore } from "react";
import { getPref, resolve, subscribeToThemePref } from "/src/lib/theme";

// chart.js and @nivo/geo need literal color strings — they can't consume
// Tailwind classes or CSS custom properties directly — so these mirror the
// hex literals declared in globals.css's :root / :root.dark blocks and must
// be kept in sync by hand if those token values ever change.
interface ChartPalette {
  categorical: string[];
  sequential: string[];
  unknown: string;
  border: string;
  text: string;
}

const LIGHT: ChartPalette = {
  categorical: ["#2b0957", "#4355b9", "#ebbf83", "#ba1a1a", "#2e7d32", "#8596ff"],
  sequential: ["#ebe7e7", "#d6baff", "#41246d", "#2b0957"],
  unknown: "#ccc4d1",
  border: "#fcf9f8",
  text: "#1c1b1b",
};

const DARK: ChartPalette = {
  categorical: ["#d6baff", "#b8c3ff", "#ebbf83", "#ffb4ab", "#81c784", "#29348f"],
  sequential: ["#2a2929", "#4a2f7a", "#6d509a", "#d6baff"],
  unknown: "#4a4550",
  border: "#141313",
  text: "#e5e2e1",
};

const getServerSnapshot = () => "light" as const;

export function useChartColors(): ChartPalette {
  const resolvedTheme = useSyncExternalStore(
    subscribeToThemePref,
    () => resolve(getPref()),
    getServerSnapshot,
  );
  return resolvedTheme === "dark" ? DARK : LIGHT;
}
