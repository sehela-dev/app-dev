"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetProductDetail } from "@/hooks/api/queries/admin/products";
import { PenIcon } from "lucide-react";
import { useParams } from "next/navigation";

export const ProductDetailView = () => {
  const params = useParams();
  const { id } = params;

  const { data, isLoading, refetch } = useGetProductDetail(id as string);
  console.log(data);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-4">
                <h3 className="text-2xl font-semibold items-center">Product Details</h3>
                <Badge>{data?.data?.is_rentable ? "For Rent" : "For Sell"}</Badge>
              </div>
              <p className="text-sm text-gray-500">Review all session details and make updates as needed</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              {/* <div>
              <Button variant={"outline"}>
                <File /> Export
              </Button>
            </div> */}
              <div>
                <Button onClick={() => {}}>
                  <PenIcon /> Edit
                </Button>
              </div>
            </div>
          </div>
          <Divider className="my-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p>Basic Information</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
