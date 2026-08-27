import { ShieldCheck, BookOpen, UserCheck } from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
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
          <Heading as="h2" size="h1" className="text-primary">
            Built for every role
          </Heading>
          <Text className="text-on-surface-variant">
            Whichever seat you take, CaseNest has a dashboard tailored to it.
          </Text>
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
              <Heading as="h3" size="h3" className="text-on-surface">
                For {role}s
              </Heading>
              <Text size="small" className="text-on-surface-variant">
                {description}
              </Text>
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
