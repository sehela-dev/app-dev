"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthMember } from "@/context/member.ctx";

const AUTH_PATHS = ["/auth", "/complete-profile"];

/** A signed-in teacher belongs in /teacher, not in the student flow. */
export default function TeacherRedirectGuard({ children }: { children: React.ReactNode }) {
  const { isAuthReady, profile } = useAuthMember();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady || profile?.role !== "teacher") return;
    if (pathname.startsWith("/teacher")) return;
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return;
    router.replace("/teacher");
  }, [isAuthReady, profile?.role, pathname, router]);

  return <>{children}</>;
}
