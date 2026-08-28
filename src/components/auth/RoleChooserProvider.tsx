"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import RoleChooser from "/src/components/auth/RoleChooser";

interface RoleChooserContextValue {
  openRoleChooser: () => void;
}

const RoleChooserContext = createContext<RoleChooserContextValue | null>(null);

export function RoleChooserProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openRoleChooser = useCallback(() => setOpen(true), []);
  const closeRoleChooser = useCallback(() => setOpen(false), []);

  return (
    <RoleChooserContext.Provider value={{ openRoleChooser }}>
      {children}
      <RoleChooser open={open} onClose={closeRoleChooser} />
    </RoleChooserContext.Provider>
  );
}

export function useRoleChooser(): RoleChooserContextValue {
  const context = useContext(RoleChooserContext);
  if (!context) {
    throw new Error("useRoleChooser must be used within a RoleChooserProvider");
  }
  return context;
}

export default RoleChooserProvider;
