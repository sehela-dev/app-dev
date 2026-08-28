import { ForgotPasswordPageView } from "@/view/auth/forgot-password";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password — Sehela Space",
  description: "Forgot Password at Sehela Space",
};


export default function Home() {
  return <ForgotPasswordPageView />;
}