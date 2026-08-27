"use client";

import Button, { type ButtonProps } from "/src/components/ui/Button";
import { useToast } from "/src/components/ui/Toast";

const PLACEHOLDER_MESSAGE = "Role selection lands in Phase 2";

export default function ToastButton(props: ButtonProps) {
  const { showToast } = useToast();

  return (
    <Button
      {...props}
      onClick={() => showToast({ variant: "info", message: PLACEHOLDER_MESSAGE })}
    />
  );
}
