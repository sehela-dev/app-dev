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

  useEffect(() => {
    // wait until auth state ready
    if (!isAuthReady) return;

    // already logged in → redirect
    if (isAuthenticated && !isAuthCallback) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthReady, router, isAuthCallback]);

  // prevent flicker while checking
  if (!isAuthReady) return null;

  // don't render login page if logged in
  if (isAuthenticated && !isAuthCallback) return null;

  return <>{children}</>;
}
