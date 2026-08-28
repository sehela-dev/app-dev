import { ResetPasswordPageView } from "@/view/auth/reset-password";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — Sehela Space",
  description: "Reset Password at Sehela Space",
};


export default function Home() {
  return <ResetPasswordPageView />;
}