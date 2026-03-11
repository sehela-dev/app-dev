"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthMember } from "@/context/member.ctx";

export default function AuthMemberGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuthMember();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isAuthReady, router]);

  // block protected content until auth is known
  if (!isAuthReady) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
