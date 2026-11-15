import TeacherShell from "@/layout/teacher/teacher-shell";

export default function TeacherLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <TeacherShell>{children}</TeacherShell>;
}
