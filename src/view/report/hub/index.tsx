"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportHubCards } from "@/constants/nav-item";
import { useAdminPermission } from "@/hooks/use-role-access";
import { filterNavItems } from "@/lib/helper";
import { ChevronRight } from "lucide-react";

const DESCRIPTIONS: Record<string, string> = {
  "/admin/report/orders": "Monthly orders preview and CSV export.",
  "/admin/report/refund-report": "Refund & void preview and CSV export.",
  "/admin/report/sales-summary": "Daily collected sales by payment method.",
  "/admin/report/customer-loyalty": "Per-customer attendance and purchase summary.",
  "/admin/report/outstanding-credit": "Monthly outstanding credit closings and ledger.",
  "/admin/report/cash-flow": "Daily cash movement by date and branch.",
  "/admin/report/teacher": "Teacher payroll preview and CSV export.",
};

export const ReportHubView = () => {
  const { can } = useAdminPermission();
  const cards = filterNavItems(reportHubCards, can);

  if (cards.length === 0) {
    return <p className="text-muted-foreground text-sm">No reports available for your role.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((item) => (
        <a key={item.url} href={item.url}>
          <Card className="hover:border-brand-500 h-full transition-colors">
            <CardHeader className="flex flex-row items-center gap-3">
              {item.icon && <item.icon className="size-5 shrink-0" />}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{DESCRIPTIONS[item.url] ?? ""}</CardDescription>
              </div>
              <ChevronRight className="size-4 shrink-0" />
            </CardHeader>
          </Card>
        </a>
      ))}
    </div>
  );
};
