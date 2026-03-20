"use client";

import MainLayoutWithNav from "@/layout/main-layout-with-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayoutWithNav showNav={false}>{children}</MainLayoutWithNav>;
}
