"use client";

import React from "react";
import { SidebarIcon, HomeIcon } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { dataNavMain, dataNavMarketPlace } from "@/constants/nav-item";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<unknown>;
  items?: NavItem[];
};

type DetailRule = {
  pattern: RegExp;
  getLabel: (ctx: { pathname: string }) => string;
};

// 🧩 1. RULE KHUSUS UNTUK HALAMAN DETAIL (GAMPANG DIEDIT DI SINI AJA)
const breadcrumbDetailRules: DetailRule[] = [
  {
    pattern: /^\/admin\/orders\/add-transactions$/,
    getLabel: () => "Add Transaction",
  },
  {
    pattern: /^\/admin\/orders\/[^/]+$/,
    getLabel: () => "Receipt",
  },
  {
    pattern: /^\/admin\/products\/[^/]+$/,
    getLabel: () => "Product Detail",
  },
  {
    pattern: /^\/admin\/class\/[^/]+$/,
    getLabel: () => "Class Detail",
  },
];

// 🧠 2. CARI JEJAK MENU (PARENT → CHILD) BERDASARKAN URL
function findTrail(items: NavItem[], pathname: string): NavItem[] {
  for (const item of items) {
    const isRealUrl = item.url && item.url !== "#" && pathname.startsWith(item.url);

    if (isRealUrl) {
      if (item.items && item.items.length > 0) {
        const childTrail = findTrail(item.items, pathname);
        if (childTrail.length > 0) {
          return [item, ...childTrail];
        }
      }
      return [item];
    }

    if (item.items && item.items.length > 0) {
      const childTrail = findTrail(item.items, pathname);
      if (childTrail.length > 0) {
        return [item, ...childTrail];
      }
    }
  }

  return [];
}

// 🧠 3. LABEL FALLBACK KALAU URL GA ADA DI MENU
function getFallbackLabel(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  if (!last) return "Dashboard";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🧠 4. BANGUN BREADCRUMB SIAP PAKAI (DARI MENU + RULE DETAIL)
function buildBreadcrumb(pathname: string) {
  const mergedNav: NavItem[] = [...(dataNavMain as NavItem[]), ...(dataNavMarketPlace as NavItem[])];

  const baseTrail = findTrail(mergedNav, pathname);
  const detailRule = breadcrumbDetailRules.find((rule) => rule.pattern.test(pathname));

  return {
    baseTrail,
    detailLabel: detailRule ? detailRule.getLabel({ pathname }) : null,
  };
}

/* ============================================================= */

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname() || "";

  const { baseTrail, detailLabel } = buildBreadcrumb(pathname);
  const hasTrail = baseTrail.length > 0;

  return (
    <header className="bg-brand-25 sticky top-0 z-50 flex w-full items-center border-b border-brand-100">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        {/* Sidebar toggle */}
        <Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* 🔗 Breadcrumb */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {/* HOME */}
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <HomeIcon className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* DARI MENU */}
            {hasTrail ? (
              <>
                {baseTrail.map((item, index) => {
                  const isLast = index === baseTrail.length - 1 && !detailLabel; // kalau ada detailLabel, last-nya nanti

                  return (
                    <React.Fragment key={item.title + index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="flex items-center gap-1">{item.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.url && item.url !== "#" ? item.url : "#"} className="flex items-center gap-1">
                            {item.title}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}

                {/* LEVEL TAMBAHAN KHUSUS HALAMAN DETAIL */}
                {detailLabel && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{detailLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            ) : (
              // FALLBACK KALAU URL GA KETEMU DI MENU
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getFallbackLabel(pathname)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
      </div>
    </header>
  );
}
