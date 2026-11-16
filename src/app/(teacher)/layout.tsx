import { AuthProvider } from "@/context/member.ctx";
import TeacherGuard from "@/layout/teacher/teacher-guard";

export default function TeacherRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <TeacherGuard>{children}</TeacherGuard>
    </AuthProvider>
  );
}
