import AuthSplitLayout from "/src/components/auth/AuthSplitLayout";
import StudentSignupForm from "/src/components/auth/StudentSignupForm";

export default function RegisterStudentPage() {
  return (
    <AuthSplitLayout>
      <StudentSignupForm />
    </AuthSplitLayout>
  );
}
