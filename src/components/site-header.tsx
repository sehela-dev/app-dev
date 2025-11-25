"use client";

import { SidebarIcon, HomeIcon } from "lucide-react";
import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchForm } from "@/components/search-form";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

// IMPORT SEMUA NAV
import { dataNavMain, dataNavMarketPlace } from "@/constants/nav-item";

type NavItem = {
  title: string;
  url: string;

  items?: NavItem[];
};

/* ---------- FUNGSI MENCARI RUTE BREADCRUMB ---------- */
function findTrail(nav: NavItem[], pathname: string): NavItem[] {
  for (const item of nav) {
    const isRealUrl = item.url && item.url !== "#" && pathname.startsWith(item.url);
    if (isRealUrl) {
      if (item.items) {
        const child = findTrail(item.items, pathname);
        if (child.length) return [item, ...child];
      }
      return [item];
    }

    if (item.items) {
      const child = findTrail(item.items, pathname);
      if (child.length) return [item, ...child];
    }
  }
  return [];
}

/* ---------- FUNGSI FALLBACK BILA RUTE TIDAK DITEMUKAN ---------- */
function fallbackLabel(pathname: string) {
  const last = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ============================================================= */
export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname() || "";

  // gabungkan semua menu menjadi 1 struktur navigasi
  const mergedNav = [...dataNavMain, ...dataNavMarketPlace];

  // generate breadcrumb route
  const trail = findTrail(mergedNav, pathname);
  const hasTrail = trail.length > 0;

  return (
    <header className="bg-brand-25 sticky top-0 z-50 flex w-full items-center border-b border-brand-100">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        {/* SIDEBAR BUTTON */}
        <Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* 🔥 BREADCRUMB AUTO */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {/* Home */}
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <HomeIcon className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* Dynamic */}
            {hasTrail ? (
              trail.map((item, i) => {
                const isLast = i === trail.length - 1;

                return (
                  <React.Fragment key={item.title + i}>
                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="flex items-center gap-1">{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.url !== "#" ? item.url : "#"} className="flex items-center gap-1">
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })
            ) : (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{fallbackLabel(pathname)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* SEARCH BAR */}
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
