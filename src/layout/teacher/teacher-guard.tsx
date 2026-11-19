"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthMember } from "@/context/member.ctx";
import { getSession } from "@/lib/auth-storage";

/** Teacher area guard. Non-teachers go to their own home. */
export default function TeacherGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, profile, refetch } = useAuthMember();
  const role = profile?.role;

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/auth/teacher-login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (role && role !== "teacher") {
      router.replace(role === "admin" || role === "manager" ? "/admin/dashboard" : "/");
    }
  }, [isAuthReady, isAuthenticated, role, router]);

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 text-brand-700">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Checking your account...</span>
      </div>
    );
  }

  if (role === undefined) {
    const hasSession = Boolean(getSession<{ access_token?: string }>("user")?.access_token);
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-brand-100 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-brand-900">Could not load your profile</h1>
          <p className="mt-2 text-sm text-brand-700">
            {hasSession
              ? "Your teacher profile did not load. Try again, or sign in with another account."
              : "Your session has expired. Please sign in again."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" onClick={() => refetch?.()}>Try again</Button>
            <Button onClick={() => router.replace("/auth/teacher-login")}>Sign in</Button>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "teacher") return null;

  return <>{children}</>;
}
