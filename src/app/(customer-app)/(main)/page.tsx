import { HomeView } from "@/view/home";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Sehela Space",
  description: "Home at Sehela Space",
};


export default function Home() {
  return <HomeView />;
}