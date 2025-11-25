import type React from "react";

import MainLayout from "@/layout/main-layout";
import AuthLayout from "@/layout/auth-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthLayout>{children}</AuthLayout>;
}
