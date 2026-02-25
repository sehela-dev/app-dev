"use client";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-[100vh] flex flex-col sm:bg-brand-100 w-[100vw] overflow-hidden">
      <div className=" min-h-[100vh] sm:mx-auto w-full max-w-dvw sm:max-w-[414px] bg-brand-50  flex flex-col">
        {/* Header (fixed height, non-scrolling) */}

        {/* Content (only this scrolls) */}
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

        {/* Footer / mobile menu (fixed height, non-scrolling) */}
      </div>
    </div>
  );
}
