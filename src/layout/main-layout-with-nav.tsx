"use client";
import { MainHeaderComponent, MainBottomNav } from "@/components/layout";

export default function MainLayout({ children, showNav }: Readonly<{ children: React.ReactNode; showNav?: boolean }>) {
  return (
    <div className="h-dvh flex flex-col sm:bg-brand-100 w-[100vw]">
      <div className="sm:mx-auto w-full max-w-dvw sm:max-w-[414px] bg-brand-50 h-dvh flex flex-col">
        {/* Header (fixed height, non-scrolling) */}
        <MainHeaderComponent />

        {/* Content (only this scrolls) */}
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        {/* Footer / mobile menu (fixed height, non-scrolling) */}
        {showNav && <MainBottomNav />}
      </div>
    </div>
  );
}
