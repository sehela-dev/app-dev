// import { AuthMemberProvider } from "@/context/member.ctx";
// import AuthMemberGuard from "@/layout/authguard-member-layout";
import { CartProvider } from "@/context/cart.ctx";
import { AuthProvider } from "@/context/member.ctx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sehela App",
  description: "Sehela Booking App",
};

// will put context here
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
