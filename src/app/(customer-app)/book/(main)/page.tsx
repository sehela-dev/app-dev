import { Suspense } from "react";

import { BookClassView } from "@/view/book";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Classes — Sehela Space",
  description: "Book Classes at Sehela Space",
};


export default function Home() {
  return (
    <Suspense fallback={null}>
      <BookClassView />
    </Suspense>
  );
}