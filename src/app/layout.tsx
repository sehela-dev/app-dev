import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "sonner";
import { NavigationProvider } from "@/context/nav-context";

export const metadata: Metadata = {
  title: "Sehela App",
  description: "Sehela Booking App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
