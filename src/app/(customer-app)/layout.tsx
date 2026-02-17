import { AuthMemberProvider } from "@/context/member.ctx";
import AuthMemberGuard from "@/layout/authguard-member-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sehela App",
  description: "Sehela Booking App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthMemberProvider>
      <AuthMemberGuard>{children}</AuthMemberGuard>
    </AuthMemberProvider>
  );
}
