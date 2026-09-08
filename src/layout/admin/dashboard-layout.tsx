import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminAuthGuard } from "./auth-admin-guard";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function DashboardLayouut({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminAuthGuard>
      <div className="[--header-height:calc(--spacing(14))] max-w-dvw min-w-full">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset className="min-w-0 max-w-full overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 p-8 bg-brand-00 border border-brand-100 w-full max-w-full min-w-0 overflow-x-hidden">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </AdminAuthGuard>
  );
}
