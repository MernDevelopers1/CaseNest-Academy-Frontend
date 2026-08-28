import { notFound } from "next/navigation";
import AuthSplitLayout from "/src/components/auth/AuthSplitLayout";
import LoginForm from "/src/components/auth/LoginForm";
import { isRole } from "/src/components/auth/roles";
import type { Role } from "/src/components/auth/roles";

function assertValidRole(value: string): asserts value is Role {
  if (!isRole(value)) notFound();
}

export default async function LoginPage(props: PageProps<"/login/[role]">) {
  const { role } = await props.params;
  assertValidRole(role);

  return (
    <AuthSplitLayout>
      <LoginForm role={role} />
    </AuthSplitLayout>
  );
}
