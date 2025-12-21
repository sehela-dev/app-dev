"use client";

import type React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthAdmin } from "@/context/admin/admin-context";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

export const AdminAuthGuard: React.FC<AuthGuardProps> = ({ children, fallback, requireAdmin }) => {
  const { isAuthenticated, isLoading, user } = useAuthAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <AdminRequiredFallback />;
  }
  if (requireAdmin && user?.role !== "manager") {
    return fallback || <SuperAdminRequiredFallback />;
  }

  return <>{children}</>;
};

// const UnauthorizedFallback: React.FC = () => {
//   return (
//     <div className="flex min-h-screen items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//             <Lock className="h-6 w-6 text-red-600" />
//           </div>
//           <CardTitle>Access Denied</CardTitle>
//           <CardDescription>You need to be logged in to access this page.</CardDescription>
//         </CardHeader>
//       </Card>
//     </div>
//   );
// };

const AdminRequiredFallback: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Admin Access Required</CardTitle>
          <CardDescription>You need administrator privileges to access this page.</CardDescription>
          <CardContent>
            <Button onClick={() => router.push("/admin-login")} variant={"outline"} className="mt-2 min-w-[250px]">
              Sign in
            </Button>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

const SuperAdminRequiredFallback: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Super Admin Access Required</CardTitle>
          <CardDescription>You need super administrator privileges to access this page.</CardDescription>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant={"outline"} className="mt-2 min-w-[250px]">
              Back to dashboard
            </Button>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};
