"use client";
import { LogoComponent } from "@/components/asset/logo";
import { useJwtToken } from "@/hooks";
import { useGetProfileCallback } from "@/hooks/api/queries/customer/profile";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/*
=== TODO ===
this page only store the token
no fetching data



*/

export const AuthCallBackPage = () => {
  const router = useRouter();
  const [token, setToken] = useState<{ access_token: string; refresh_token: string } | null>(null);

  const { setJwtToken } = useJwtToken();

  useEffect(() => {
    const hash = window.location.hash;
    // console.log(hash);

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token") as string;
      const refreshToken = params.get("refresh_token") as string;

      setToken({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      setJwtToken({
        access_token: accessToken,
      });

      // optional but recommended — remove token from URL
      // window.history.replaceState(null, "", "/callback");
    } else {
      router.push("/auth/login");
      // toast.error("Link Expired!", {
      //   id: "error",
      //   position: "top-center",
      // });
    }
  }, [router]);

  const { data, isLoading } = useGetProfileCallback(token?.access_token as string);

  useEffect(() => {
    if (!data?.data) return;
    if (!data?.data?.is_profile_complete) {
      router.push("/complete-profile");
    } else {
      setJwtToken({
        access_token: token?.access_token as string,
        refresh_token: token?.refresh_token as string,

        profile: {
          email: data?.data?.email,
          name: data?.data?.full_name,
          id: data?.data?.id,
          overview: data?.data?.overview,
        },
      });
      router.replace("/");
    }
  }, [data, router]);

  if (isLoading)
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
};
