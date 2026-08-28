"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, GraduationCap, Users, Waypoints } from "lucide-react";
import Modal from "/src/components/ui/Modal";
import type { Role } from "/src/components/auth/roles";

interface RoleChooserProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_CARDS: {
  role: Role;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  iconClasses: string;
}[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Manage platform settings, users, and overall system health.",
    icon: ShieldCheck,
    iconClasses: "bg-primary-container text-on-primary-container",
  },
  {
    role: "tutor",
    label: "Tutor",
    description: "Review case studies, guide discussions, and lead peer sessions.",
    icon: GraduationCap,
    iconClasses: "bg-secondary-container text-on-secondary-container",
  },
  {
    role: "student",
    label: "Student",
    description: "Submit studies, review materials, and participate actively.",
    icon: Users,
    iconClasses: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
];

export default function RoleChooser({ open, onClose }: RoleChooserProps) {
  const router = useRouter();

  function handleSelect(role: Role) {
    onClose();
    router.push(`/login/${role}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose your role to continue"
      size="lg"
      className="max-w-2xl"
    >
      <div className="flex flex-col items-center gap-sm text-center">
        <div className="flex items-center gap-xs text-primary">
          <Waypoints size={20} aria-hidden="true" />
          <span className="text-h4 font-bold tracking-tight">CaseNest</span>
        </div>
        <p className="text-body text-on-surface-variant">
          Select how you&apos;ll be using CaseNest today to ensure you see
          the right tools and information.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {ROLE_CARDS.map(({ role, label, description, icon: Icon, iconClasses }) => (
          <button
            key={role}
            type="button"
            onClick={() => handleSelect(role)}
            className="group flex flex-col items-center rounded-lg border border-outline-variant/50 bg-surface-container-low p-xl text-center transition-all duration-200 hover:border-primary hover:bg-surface hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div
              className={`mb-lg flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 ${iconClasses}`}
            >
              <Icon size={28} />
            </div>
            <h3 className="mb-xs text-h3 text-on-surface transition-colors group-hover:text-primary">
              {label}
            </h3>
            <p className="text-small text-on-surface-variant">
              {description}
            </p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
