import { Suspense } from "react";

import { SessionDetailView } from "@/view/book/sessions";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <SessionDetailView />
    </Suspense>
  );
}
