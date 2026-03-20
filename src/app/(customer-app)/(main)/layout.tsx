"use client";
import { usePathname } from "next/navigation";

import MainLayoutWithNav from "@/layout/main-layout-with-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Hide bottom navigation on pages that need more vertical space.
  // For dynamic routes like `/something/[id]`, include only the static prefix,
  // e.g. `"/admin-dashboard/session/detail"`.
  const HIDE_NAV_PREFIXES = ["/profile/my-credits"] as const;

  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => {
    // Match either the exact prefix path or any nested path under it.
    // Examples:
    // - prefix "/profile/my-credits" matches "/profile/my-credits" and "/profile/my-credits/..."
    // - prefix "/foo/bar" matches "/foo/bar/baz" (including "/foo/bar/123")
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });

  return <MainLayoutWithNav showNav={!hideNav}>{children}</MainLayoutWithNav>;
}
