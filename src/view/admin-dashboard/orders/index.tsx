import { Card } from "@/components/ui/card";

export const OrdersPageView = () => {
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between">
        <div>tabs</div>
        <div>actions</div>
      </div>
      <Card className="rounded-lg border-brand-100"></Card>
    </div>
  );
};
