"use client";
import { LogoComponent } from "@/components/asset/logo";
import { Button } from "@/components/ui/button";
import { useJwtToken } from "@/hooks";
import { useGetProfile, useGetProfileCallback } from "@/hooks/api/queries/customer/profile";
import { Loader2, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/*
=== TODO ===
this page only store the token
no fetching data
*/

const parseHashTokens = () => {
  if (typeof window === "undefined") return { access_token: "", refresh_token: "" };

  const hash = window.location.hash;
  if (!hash) return { access_token: "", refresh_token: "" };

  const params = new URLSearchParams(hash.substring(1));
  return {
    access_token: (params.get("access_token") as string) ?? "",
    refresh_token: (params.get("refresh_token") as string) ?? "",
  };
};

const parseHashError = () => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  // also support ?error= in search as fallback (Supabase sometimes uses query)
  const search = window.location.search;
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const searchParams2 = new URLSearchParams(search);
  const error = hashParams.get("error") ?? searchParams2.get("error");
  const error_code = hashParams.get("error_code") ?? searchParams2.get("error_code");
  const rawDesc = hashParams.get("error_description") ?? searchParams2.get("error_description");
  if (!error && !error_code) return null;
  // Supabase encodes spaces as + : "Email+link+is+invalid+or+has+expired"
  const error_description = rawDesc ? decodeURIComponent(rawDesc.replace(/\+/g, " ")) : null;
  return { error, error_code, error_description };
};

export const AuthCallBackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // support both ?token= and ?code= (supabase sometimes uses code) and handle email alias
  const getTokenFromParams = () => {
    const qpToken = searchParams.get("token") ?? searchParams.get("code");
    const qpEmail = searchParams.get("email");
    if (qpToken && qpEmail) return { token: qpToken, email: qpEmail };
    // fallback: parse window.location directly (covers hash fallback and SSR edge)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("token") ?? url.searchParams.get("code") ?? new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
      const e = url.searchParams.get("email") ?? new URLSearchParams(window.location.hash.replace(/^#/, "")).get("email");
      if (t && e) return { token: t, email: e };
    }
    return null;
  };
  const qp = getTokenFromParams();
  const qpToken = qp?.token ?? null;
  const qpEmail = qp?.email ?? null;
  const isTokenCallback = !!qpToken && !!qpEmail; // 15m complete_profile token (no JWT)

  const { setJwtToken, resetJwt, isHydrated, access_token: storedAccessToken } = useJwtToken();
  const [tokens, setTokens] = useState<{ access_token: string; refresh_token: string }>({ access_token: "", refresh_token: "" });
  const [isReady, setIsReady] = useState(false);
  // sync parse — avoids one-render delay where hash#error is stuck on Loading...
  const hashError = typeof window !== "undefined" ? parseHashError() : null;

  // If already have session in localStorage, use it to decide where to go (avoids "Link Expired" when hash empty)
  const { data: storedProfile, isLoading: storedLoading } = useGetProfile(Boolean(storedAccessToken) && isHydrated && !isTokenCallback && !tokens.access_token);

  // Token path: redirect to /complete-profile with token+email (verify+countdown handled there)
  useEffect(() => {
    if (isTokenCallback && qpToken && qpEmail) {
      // use href to ensure navigation works even if router state stale; keep token as-is
      router.replace(`/complete-profile?token=${encodeURIComponent(qpToken)}&email=${encodeURIComponent(qpEmail)}`);
      // fallback if soft nav fails
      const t = setTimeout(() => {
        if (window.location.pathname !== "/complete-profile") window.location.href = `/complete-profile?token=${encodeURIComponent(qpToken)}&email=${encodeURIComponent(qpEmail)}`;
      }, 800);
      return () => clearTimeout(t);
    }
  }, [isTokenCallback, qpToken, qpEmail, router]);

  const { data, isLoading, isError } = useGetProfileCallback(tokens?.access_token);

  useEffect(() => {
    setTokens(parseHashTokens());
    setIsReady(true);
  }, []);

  useEffect(() => {
    // optional but recommended — remove token from URL
    if (tokens.access_token) {
      window.history.replaceState(null, "", "/auth/callback");
    }
  }, [tokens.access_token]);

  useEffect(() => {
    if (isError) {
      // token in the link is invalid/expired → drop any stale session
      resetJwt();
    }
  }, [isError, resetJwt]);

  useEffect(() => {
    if (!data?.data) return;

    if (!data?.data?.is_profile_complete) {
      setJwtToken({
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
      });
      router.push("/complete-profile");
    } else {
      setJwtToken({
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
        profile: {
          email: data?.data?.email,
          name: data?.data?.full_name,
          id: data?.data?.id,
          overview: data?.data?.overview,
        },
      });
      router.replace("/");
    }
  }, [data, router, setJwtToken, tokens]);

  // Already logged in via localStorage → skip hash check, go by profile complete flag
  // but don't auto-redirect if hash contains explicit error (otp_expired) — let error UI show
  useEffect(() => {
    if (isTokenCallback) return;
    if (hashError) return;
    if (!isHydrated) return;
    if (!storedAccessToken) return;
    if (!storedProfile?.data) return;
    if (!storedProfile.data.is_profile_complete) {
      router.replace("/complete-profile");
    } else {
      router.replace("/");
    }
  }, [isHydrated, storedAccessToken, storedProfile, isTokenCallback, hashError, router]);

  if (isTokenCallback) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-brand-500">Redirecting to complete profile...</p>
          </div>
        </div>
        <div className="w-full mx-auto max-w-[361px] px-6">
          <Button variant="outline" className="w-full" onClick={() => window.location.href = `/complete-profile?token=${encodeURIComponent(qpToken!)}&email=${encodeURIComponent(qpEmail!)}`}>
            Continue to Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  // Supabase magiclink error (#error=access_denied&error_code=otp_expired) — show immediately, don't stuck on Loading/Fetching
  // covers both #hash and ?search variants: /auth/callback#error=... or /auth/callback?error=...
  if (hashError) {
    const isOtpExpired = hashError.error_code === "otp_expired" || hashError.error === "access_denied";
    const title = "Link Expired";
    const desc = hashError.error_description ?? (isOtpExpired ? "Email link is invalid or has expired." : "This link is invalid or has expired. Please request a new link to continue.");
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div className="w-full mx-auto max-w-[361px] px-6">
          <div className="bg-white mx-auto w-full px-6 rounded-md pt-10 pb-6 flex flex-col items-center text-center gap-4">
            <TriangleAlert className="h-10 w-10 text-brand-400" />
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-brand-500 leading-tight">{title}</h3>
              <p className="text-sm font-normal text-brand-400 leading-tight">{desc}</p>
              {hashError.error_code && <p className="text-xs font-mono text-brand-300">{hashError.error_code}</p>}
            </div>
            <Button
              className="w-full max-h-[42px] min-h-[42px] text-sm"
              onClick={() => {
                if (typeof window !== "undefined") window.history.replaceState(null, "", "/auth/callback");
                resetJwt();
                router.push("/auth/sign-up");
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              className="w-full max-h-[42px] min-h-[42px] text-sm"
              onClick={() => {
                if (typeof window !== "undefined") window.history.replaceState(null, "", "/auth/callback");
                resetJwt();
                router.push("/auth/login");
              }}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // localStorage session exists → show fetching while we decide
  if (!isTokenCallback && isHydrated && storedAccessToken && storedLoading) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-brand-500">Fetching data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-brand-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        {/* Logo */}
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>

        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-brand-500">Fetching data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || (isReady && !tokens.access_token && !storedAccessToken && !isTokenCallback)) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        {/* Logo */}
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>

        {/* Main Content */}
        <div className="w-full mx-auto max-w-[361px] px-6">
          <div className="bg-white mx-auto w-full px-6 rounded-md pt-10 pb-6 flex flex-col items-center text-center gap-4">
            <TriangleAlert className="h-10 w-10 text-brand-400" />
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-brand-500 leading-tight">Link Expired</h3>
              <p className="text-sm font-normal text-brand-400 leading-tight">This link is invalid or has expired. Please request a new link to continue.</p>
            </div>
            <Button
              className="w-full max-h-[42px] min-h-[42px] text-sm"
              onClick={() => {
                resetJwt();
                router.push("/auth/sign-up");
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              className="w-full max-h-[42px] min-h-[42px] text-sm"
              onClick={() => {
                resetJwt();
                router.push("/auth/login");
              }}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
