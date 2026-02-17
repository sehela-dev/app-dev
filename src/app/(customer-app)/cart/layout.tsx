import type React from "react";

import { NavigationProvider } from "@/context/nav-context";
import CartLayout from "@/layout/cart-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationProvider>
      <CartLayout>{children}</CartLayout>
    </NavigationProvider>
  );
}
