import { SuccessWaitingListView } from "@/view/waiting-list-success";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waiting List — Sehela Space",
  description: "Waiting List at Sehela Space",
};


export default function Home() {
  return <SuccessWaitingListView />;
}