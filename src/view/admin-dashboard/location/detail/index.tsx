"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetLocationDetail } from "@/hooks/api/queries/admin/locations";
import { formatDateHelper } from "@/lib/helper";
import { ExternalLink, Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export const LocationDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetLocationDetail(id as string);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold">Location Information</h3>
              <p className="text-sm text-gray-500">Review the location information.</p>
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
            <div className="grid grid-cols-12 gap-4">
              <div className="grid col-span-3 text-gray-500">Location Name</div>
              <div className="grid col-span-9">{data?.data?.name}</div>
              <div className="grid col-span-3 text-gray-500">Address</div>
              <div className="grid col-span-9">{data?.data?.address ?? "-"}</div>
              <div className="grid col-span-3 text-gray-500">Maps URL</div>
              <div className="grid col-span-9">
                {data?.data?.maps_url ? (
                  <a href={data?.data?.maps_url} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center gap-1 text-brand-500 hover:underline">
                    Open in Maps <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  "-"
                )}
              </div>
              <div className="grid col-span-3 text-gray-500">Status</div>
              <div className={`grid col-span-9 capitalize ${data?.data?.is_active ? `text-green-500` : `text-red-500`}`}>
                {data?.data?.is_active ? "Active" : "Inactive"}
              </div>
              <div className="grid col-span-3 text-gray-500">Created At</div>
              <div className="grid col-span-9">{formatDateHelper(data?.data?.created_at as string)}</div>
              <div className="grid col-span-3 text-gray-500">Updated At</div>
              <div className="grid col-span-9">{formatDateHelper(data?.data?.updated_at as string)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
