import { SignUpViewPage } from "@/view/auth/sign-up";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Sehela Space",
  description: "Sign Up at Sehela Space",
};


export default function Home() {
  return <SignUpViewPage />;
}