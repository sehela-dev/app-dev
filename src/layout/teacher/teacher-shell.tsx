"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { LogoComponent } from "@/components/asset/logo";
import { Button } from "@/components/ui/button";
import { useAuthMember } from "@/context/member.ctx";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/teacher/sessions", label: "Sessions" },
  { href: "/teacher/invoices", label: "Invoices" },
];

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthMember();

  return (
    <div className="min-h-dvh bg-brand-00 font-serif text-brand-900">
      <header className="border-b border-brand-100 bg-brand-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoComponent className="h-8 w-[99px]" />
            <span className="text-sm font-semibold text-brand-600">Teacher</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-sm text-brand-700 sm:inline">
              {user?.profile?.name ?? ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11"
              onClick={() => {
                logout();
                router.replace("/auth/teacher-login");
              }}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
        <nav aria-label="Teacher" className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
          <ul className="flex gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-t-md border-b-2 px-3 text-sm font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-50",
                      active
                        ? "border-brand-500 text-brand-900"
                        : "border-transparent text-brand-700 hover:border-brand-200 hover:text-brand-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
