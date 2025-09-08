import type React from "react";

import MainLayout from "@/layout/main-layout";
import { NavigationProvider } from "@/context/nav-context";
import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationProvider showNav={false}>
      <SessionFilterCtxProvider>
        <MainLayout>{children}</MainLayout>
      </SessionFilterCtxProvider>
    </NavigationProvider>
  );
}
