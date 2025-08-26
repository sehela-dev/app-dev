import { MainHeaderComponent, MainBottomNav } from "@/components/layout";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-dvh flex flex-col sm:bg-brand-100 w-[100vw]">
      <div className="mx-auto w-full max-w-[389px] sm:max-w-[667px] bg-brand-50 h-dvh flex flex-col">
        {/* Header (fixed height, non-scrolling) */}
        <MainHeaderComponent />

        {/* Content (only this scrolls) */}
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

        {/* Footer / mobile menu (fixed height, non-scrolling) */}
        <MainBottomNav />
      </div>
    </div>
  );
}
