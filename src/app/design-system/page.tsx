import DesignSystemPage from "@/view/design-system";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System — Sehela",
  description: "Design System at Sehela Space",
};


export default function Home() {
  return <DesignSystemPage />;
}