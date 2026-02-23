"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthMember } from "@/context/member.ctx";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuthMember();

  useEffect(() => {
    // wait until auth state ready
    if (!isAuthReady) return;

    // already logged in → redirect
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthReady, router]);

  // prevent flicker while checking
  if (!isAuthReady) return null;

  // don't render login page if logged in
  if (isAuthenticated) return null;

  return <>{children}</>;
}
