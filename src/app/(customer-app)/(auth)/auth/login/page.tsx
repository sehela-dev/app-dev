import LoginPageView from "@/view/login";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Sehela Space",
  description: "Login at Sehela Space",
};


export default function Home() {
  return <LoginPageView />;
}