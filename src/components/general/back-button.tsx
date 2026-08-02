"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const BackButtonComponent = ({
  children,
  page,
}: Readonly<{
  children: React.ReactNode;
  page?: string;
}>) => {
  const router = useRouter();
  return (
    <div className="flex flex-row items-center gap-4">
      <div>
        <Button variant="outline" className="rounded-full" onClick={() => (page ? router.push(page) : router.back())}>
          <ArrowLeft size={36} />
        </Button>
      </div>
      {children}
    </div>
  );
};
