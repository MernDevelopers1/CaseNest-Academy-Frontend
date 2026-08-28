"use client";

import Button, { type ButtonProps } from "/src/components/ui/Button";
import { useRoleChooser } from "/src/components/auth/RoleChooserProvider";

export default function RoleChooserTrigger(props: ButtonProps) {
  const { openRoleChooser } = useRoleChooser();

  return <Button {...props} onClick={openRoleChooser} />;
}
