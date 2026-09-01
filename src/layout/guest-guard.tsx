"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/context/member.ctx";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAuthReady } = useAuthMember();

  // the auth callback handles its own redirects (complete-profile / home)
  // so it must not be hijacked by the guest guard once the token is stored.
  const isAuthCallback = pathname?.startsWith("/auth/callback") ?? false;

  const getSafeRedirect = () => {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("next") ?? params.get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) return redirect;
    try {
      const stored = sessionStorage.getItem("auth.redirect");
      if (stored && stored.startsWith("/") && !stored.startsWith("//")) return stored;
    } catch {}
    return "/";
  };

  useEffect(() => {
    // wait until auth state ready
    if (!isAuthReady) return;

    // already logged in → redirect (respect booking intent)
    if (isAuthenticated && !isAuthCallback) {
      const dest = getSafeRedirect();
      // let AuthMemberGuard handle profile completeness on protected dest
      router.replace(dest);
    }
  }, [isAuthenticated, isAuthReady, router, isAuthCallback]);

  // prevent flicker while checking
  if (!isAuthReady) return null;

  // don't render login page if logged in
  if (isAuthenticated && !isAuthCallback) return null;

  return <>{children}</>;
}
