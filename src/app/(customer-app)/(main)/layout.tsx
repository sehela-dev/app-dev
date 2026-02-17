import { NavigationProvider } from "@/context/nav-context";
import MainLayout from "@/layout/main-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationProvider showNav={true}>
      <MainLayout>{children}</MainLayout>
    </NavigationProvider>
  );
}
