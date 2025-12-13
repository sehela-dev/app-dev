import type React from "react";

import DashboardLayouut from "@/layout/admin/dashboard-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayouut>{children}</DashboardLayouut>;
}
