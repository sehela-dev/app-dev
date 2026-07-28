"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetProductDetail } from "@/hooks/api/queries/admin/products";
import { formatCurrency } from "@/lib/helper";
import { IProductVariantItem } from "@/types/product.interface";
import { ChevronDown, MapPin, Package, PenIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

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
                <Button onClick={() => { }}>
                  <PenIcon /> Edit
                </Button>
              </div>
            </div>
          </div>
          <Divider className="my-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* basic information */}
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-sm">Basic Information</p>
              <div className="grid grid-cols-12 gap-2">
                <p className="text-gray-500 col-span-3">Product Name</p>
                <p className="col-span-6">{data?.data?.name}</p>
              </div>
              <div className="grid grid-cols-12 gap-2">

                <p className="text-gray-500 col-span-3">Product Category</p>
                <p className="col-span-6">{data?.data?.category?.name}</p>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <p className="text-gray-500 col-span-3">Description</p>
                <p className="col-span-6">{data?.data?.description}</p>
              </div>
            </div>
            <Divider className="my-2" />
            {/* photo */}
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-sm">Photo Product</p>
              <div className="flex flex-row items-center gap-4 justify-between">
                {Array.isArray(data?.data?.photos) &&
                  data?.data?.photos?.map((p, i) => (
                    <div className="w-[250px] h-[250px] rounded-md relative" key={`${data?.data?.name}-${i}`}>
                      <img src={p} alt={`${data?.data?.name}-${i}`} className="w-full h-full rounded-md" />
                      {i === 0 && <div className="absolute bottom-2 right-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium">COVER</div>
                      }</div>
                  ))}



              </div>
              <Divider className="my-2" />
              <div className="flex flex-col gap-2 text-sm">
                {/* <p className="font-semibold text-sm">Product Variant </p> */}


                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package size={20} />
                    Variants & Inventory
                  </h2>
                  {data?.data?.variants?.map((v) => (
                    <InventoryCardComponent variant={v} key={v.id} />
                  ))}

                </div>

              </div>


            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

interface IProps {
  variant: IProductVariantItem
}

export const InventoryCardComponent = ({ variant }: IProps) => {

  const [open, setOpen] = useState(false)
  const getStockStatus = (available: number, total: number) => {
    if (available === 0) return 'bg-red-500/10 text-red-400';
    if (available < total * 0.25) return 'bg-yellow-500/10 text-yellow-400';
    return 'bg-emerald-500/10 text-emerald-400';
  };

  const getStatusBadge = (available: number, total: number) => {
    if (available === 0) return 'Out of Stock';
    if (available < total * 0.25) return 'Low Stock';
    return 'In Stock';
  };
  return (
    <div
      key={variant.id}
      className="border border-border rounded-lg overflow-hidden bg-card transition-colors"
    >
      {/* Accordion Header */}
      <button
        onClick={() => {
          setOpen(!open)
        }}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <ChevronDown
            size={20}
            className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''
              }`}

          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{variant.variant_name}</h3>
            <p className="text-xs text-muted-foreground mt-1">SKU: {variant.sku}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-emerald-400">{formatCurrency(variant.price_idr)}</p>
              <p className="text-xs text-muted-foreground">
                {variant.stock_available}/{variant.stock_total} available
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatus(
                variant.stock_available,
                variant.stock_total
              )}`}
            >
              {getStatusBadge(variant.stock_available_to_rent, variant.stock_total)}
            </div>
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="border-t border-border px-4 py-4 bg-card space-y-4">
          {/* Stock Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Total Stock
              </p>
              <p className="text-xl font-bold text-foreground">{variant.stock_total}</p>
            </div>
            <div className="bg-card rounded border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Available
              </p>
              <p className="text-xl font-bold text-emerald-400">
                {variant.stock_available}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin size={16} />
              Stock by Location
            </h4>
            <div className="space-y-2">
              {variant.inventory.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-card rounded border border-border p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{inv.location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.location.code}
                      {inv.location.is_active ? ' • Active' : ' • Inactive'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold text-emerald-400">
                        {inv.stock_available}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold text-foreground">{inv.stock_total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

}