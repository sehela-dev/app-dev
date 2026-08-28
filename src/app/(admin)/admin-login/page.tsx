import AdminLoginPage from "@/view/admin-auth";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login — Sehela",
  description: "Admin Login - Sehela Admin Panel",
};


export default function Home() {
  return <AdminLoginPage />;
}