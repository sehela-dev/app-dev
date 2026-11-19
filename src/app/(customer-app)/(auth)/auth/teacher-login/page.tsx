import LoginPageView from "@/view/login";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Login — Sehela Space",
  description: "Teacher login at Sehela Space",
};

export default function Home() {
  return <LoginPageView mode="teacher" />;
}
