import type React from "react";

import MainLayout from "@/layout/main-layout-with-nav";

import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionFilterCtxProvider>
      <MainLayout>{children}</MainLayout>
    </SessionFilterCtxProvider>
  );
}
