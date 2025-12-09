import type React from "react";

import { AddTransactionProvider } from "@/context/admin/add-transaction.ctx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AddTransactionProvider>{children}</AddTransactionProvider>;
}
