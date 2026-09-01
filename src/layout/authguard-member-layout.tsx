"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthMember } from "@/context/member.ctx";

export default function AuthMemberGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, isCompleteProfile } = useAuthMember();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      const fullPath =
        typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
      router.replace(`/auth/login?next=${encodeURIComponent(fullPath)}`);
      return;
    }
    // FE contract: tnc_agreed_at !== null -> is_profile_complete (GET /profile)
    // Keep booking intent via ?next when profile incomplete
    if (isCompleteProfile === false) {
      const fullPath =
        typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
      // avoid loop if already on complete-profile (guard not used there but safe)
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/complete-profile")) return;
      router.replace(`/complete-profile?next=${encodeURIComponent(fullPath)}`);
    }
  }, [isAuthenticated, isAuthReady, isCompleteProfile, router]);

  // block protected content until auth is known
  if (!isAuthReady) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
