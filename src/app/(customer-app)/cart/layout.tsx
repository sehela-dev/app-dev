import type React from "react";

import CartLayout from "@/layout/cart-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CartLayout>{children}</CartLayout>;
}
