"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGetProfile } from "@/hooks/api/queries/customer/profile";
import { useJwtToken } from "@/hooks";
import { useAuthMember } from "@/context/member.ctx";

export default function AuthMemberGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuthMember();
  const { setProfile } = useJwtToken();

  // redirect if no token
  useEffect(() => {
    if (isAuthReady) {
      if (!isAuthenticated) {
        console.log("token expired");
      }
    }
  }, [isAuthReady, isAuthenticated, router]);

  // fetch profile once globally
  const { data, isLoading, error, isFetched } = useGetProfile(isAuthenticated);

  // store profile globally
  useEffect(() => {
    if (isFetched) {
      setProfile(data?.data);
    }
  }, [isFetched]);

  // if (!isAuthenticated || isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (error) {
    router.replace("/auth/login");
    return null;
  }

  return <>{children}</>;
}
