import type React from "react";

import MainLayout from "@/layout/main-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <NavigationProvider>
    <MainLayout>{children}</MainLayout>
    // </NavigationProvider>
  );
}
