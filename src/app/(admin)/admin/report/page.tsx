import { ReportHubView } from "@/view/report/hub";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports — Sehela Admin",
  description: "Reports - Sehela Admin Panel",
};

export default function Page() {
  return <ReportHubView />;
}
