"use client";

import { useEffect } from "react";
import { initTheme } from "/src/lib/theme";

export default function ThemeInit() {
  useEffect(() => initTheme(), []);

  return null;
}
