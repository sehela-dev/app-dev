"use client";
import { LogoComponent } from "@/components/asset/logo";
import { Button } from "@/components/ui/button";
import { useJwtToken } from "@/hooks";
import { useGetProfileCallback } from "@/hooks/api/queries/customer/profile";
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

export const AuthCallBackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qpToken = searchParams.get("token");
  const qpEmail = searchParams.get("email");
  const isTokenCallback = !!qpToken && !!qpEmail; // 15m complete_profile token (no JWT)

  const { setJwtToken, resetJwt } = useJwtToken();
  const [tokens, setTokens] = useState<{ access_token: string; refresh_token: string }>({ access_token: "", refresh_token: "" });
  const [isReady, setIsReady] = useState(false);

  // Token path: redirect to /complete-profile with token+email (verify+countdown handled there)
  useEffect(() => {
    if (isTokenCallback) {
      router.replace(`/complete-profile?token=${encodeURIComponent(qpToken!)}&email=${encodeURIComponent(qpEmail!)}`);
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

  if (isTokenCallback) {
    return (
      <div className="flex flex-col items-center w-full space-y-12 font-serif">
        <div className="pt-12 flex justify-center">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-brand-500">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || (isReady && !tokens.access_token)) {
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
              <p className="text-sm font-normal text-brand-400 leading-tight">
                This link is invalid or has expired. Please request a new link to continue.
              </p>
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
