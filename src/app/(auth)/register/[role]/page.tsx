import { notFound } from "next/navigation";
import AuthSplitLayout from "/src/components/auth/AuthSplitLayout";
import TutorSignupForm from "/src/components/auth/TutorSignupForm";
import StudentSignupForm from "/src/components/auth/StudentSignupForm";
import { isSignupRole } from "/src/components/auth/roles";
import type { SignupRole } from "/src/components/auth/roles";

function assertValidSignupRole(value: string): asserts value is SignupRole {
  if (!isSignupRole(value)) notFound();
}

export default async function RegisterPage(props: PageProps<"/register/[role]">) {
  const { role } = await props.params;
  assertValidSignupRole(role);

  return (
    <AuthSplitLayout>
      {role === "tutor" ? <TutorSignupForm /> : <StudentSignupForm />}
    </AuthSplitLayout>
  );
}
