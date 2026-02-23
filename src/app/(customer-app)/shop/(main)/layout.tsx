import type React from "react";

import MainLayout from "@/layout/main-layout-with-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout showNav>{children}</MainLayout>;
}
