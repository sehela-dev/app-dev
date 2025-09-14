import type React from "react";

import MainLayout from "@/layout/main-layout";
import { NavigationProvider } from "@/context/nav-context";
import { PaymentMethodProvider } from "@/context/payment-method.ctx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationProvider showNav={false}>
      <MainLayout>{children}</MainLayout>
    </NavigationProvider>
  );
}
