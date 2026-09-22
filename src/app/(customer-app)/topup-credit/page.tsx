import { TopUpCreditPageView } from "@/view/top-up";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Credits — Sehela Space",
  description: "Top Up Credits at Sehela Space",
};


export default function Home() {
  // Public catalog (A1): visible without login; Buy prompts login.
  return <TopUpCreditPageView />;
}
