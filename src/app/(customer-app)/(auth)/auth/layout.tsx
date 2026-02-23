import type React from "react";

import AuthLayout from "@/layout/auth-layout";
import GuestGuard from "@/layout/guest-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
