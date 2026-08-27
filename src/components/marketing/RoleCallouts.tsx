import { ShieldCheck, BookOpen, UserCheck } from "lucide-react";
import Card from "/src/components/ui/Card";
import ToastButton from "/src/components/marketing/ToastButton";

const ROLES = [
  {
    icon: ShieldCheck,
    role: "Admin",
    description: "Oversee tutors, students, and sessions across the platform.",
  },
  {
    icon: BookOpen,
    role: "Tutor",
    description: "Review case studies and lead discussions with your students.",
  },
  {
    icon: UserCheck,
    role: "Student",
    description: "Submit case studies and learn alongside your peers.",
  },
];

export default function RoleCallouts() {
  return (
    <section className="bg-surface px-xl py-4xl lg:px-4xl">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-sm text-center">
          <h2 className="text-h1 text-primary">Built for every role</h2>
          <p className="text-body text-on-surface-variant">
            Whichever seat you take, CaseNest has a dashboard tailored to it.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
          {ROLES.map(({ icon: Icon, role, description }) => (
            <Card
              key={role}
              className="flex flex-col items-center gap-md text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <Icon size={28} />
              </div>
              <h3 className="text-h3 text-on-surface">For {role}s</h3>
              <p className="text-small text-on-surface-variant">
                {description}
              </p>
              <ToastButton variant="secondary" size="sm">
                Continue as {role}
              </ToastButton>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
