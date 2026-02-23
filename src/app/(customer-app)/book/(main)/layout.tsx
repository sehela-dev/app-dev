import type React from "react";

import MainLayoutWithNav from "@/layout/main-layout-with-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayoutWithNav>{children}</MainLayoutWithNav>;
}
