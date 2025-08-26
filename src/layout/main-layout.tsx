export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-100 w-[100vw]">
      <div className="max-w-[667px] w-full mx-auto bg-brand-50 h-screen">{children}</div>
    </div>
  );
}
