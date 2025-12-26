"use client";

import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetCustomerDetail } from "@/hooks/api/queries/admin/customers";
import { formatDateHelper } from "@/lib/helper";
import { Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const instructorTabs = [
  {
    value: "basic",
    name: "Information",
  },
  {
    value: "activity",
    name: "Activity",
  },
];

export const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetCustomerDetail(id as string);

  const [tabs, setTabs] = useState("basic");

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-[25%]">
        <GeneralTabComponent selecetedTab={tabs} setTab={setTabs} tabs={instructorTabs} />
      </div>
      {tabs === "basic" && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center w-full justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">Member Information</h3>
                <p className="text-sm text-gray-500">Review and manage essential member data to ensure service accuracy.</p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div>
                  <Button onClick={() => router.push(`${id}/edit`)}>
                    <PenIcon /> Edit
                  </Button>
                </div>
              </div>
            </div>
            <Divider className="my-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Basic Information</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="grid col-span-3 text-gray-500">Instructor Name</div>
                  <div className="grid col-span-9">{data?.data?.profile?.full_name}</div>
                  <div className="grid col-span-3 text-gray-500">WhatsApp</div>
                  <div className="grid col-span-9">{data?.data?.profile?.phone}</div>
                  <div className="grid col-span-3 text-gray-500">Email</div>
                  <div className="grid col-span-9">{data?.data?.profile?.email}</div>
                  <div className="grid col-span-3 text-gray-500">Created At</div>
                  <div className="grid col-span-9">{formatDateHelper(data?.data?.profile?.created_at as string)}</div>
                  <div className="grid col-span-3 text-gray-500">Status</div>
                  <div className={`grid col-span-9 capitalize ${data?.data?.profile?.is_active ? `text-green-500` : `text-red-500`}`}>
                    {data?.data?.profile.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Credits</h4>
                <div className="grid gap-4 grid-cols-4">
                  {data?.data?.wallet?.active_packages?.map((item) => (
                    <Card className="border-gray-500 p-4 gap-1" key={item.package_purchase_id}>
                      <CardHeader className="p-0 font-medium text-sm">{item.package_name}</CardHeader>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-12 gap-1">
                          <div className="grid col-span-4 text-gray-500 text-sm">Amount</div>
                          <div className="grid col-span-8 text-brand-999 text-sm">{item.credits_remaining}</div>
                          <div className="grid col-span-4 text-gray-500 text-sm">Expired</div>
                          <div className="grid col-span-8 text-brand-999 text-sm">{formatDateHelper(item.expires_at, "dd MMM yyyy")}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
