/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { ManageStockDialog } from "@/components/page/dashboard/manage-stock-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAddNewVariants } from "@/hooks/api/mutations/admin";
import { useGetInventoryLocations, useGetProductDetail } from "@/hooks/api/queries/admin/products";
import { formatCurrency } from "@/lib/helper";
import { CreateProductFormValues, UpdateVariantsFormValues, variantSchema } from "@/resolver";
import { IProductVariantItem } from "@/types/product.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, MapPin, Package, PenIcon, Plus, Trash, Warehouse } from "lucide-react";
import { useParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import Select from "react-select";

type ProductVariantFormValue = NonNullable<CreateProductFormValues["variants"]>[number];
const defaultValuesVariant: ProductVariantFormValue = {
  variant_name: "",
  sku: "",
  price_idr: "",
  inventory: [], // Array of { location_id, stock_total }
  location: [], // Array for multiple selections (temporary, not in final payload)
};

export const ProductDetailView = () => {
  const params = useParams();
  const { id } = params;
  const [openAddVariant, setOpenAddVariant] = useState(false);
  const [openManageStock, setOpenManageStock] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariantItem | null>(null);
  const methods = useForm<UpdateVariantsFormValues>({
    defaultValues: {
      variants: [{ ...defaultValuesVariant }],
    },
    resolver: zodResolver(variantSchema),
  });
  const { control, handleSubmit, watch } = methods;
  const { fields, append, remove } = useFieldArray({ name: "variants", control, keyName: "id" });
  const { mutateAsync } = useAddNewVariants();

  // Watch the variants to track location changes
  const variants = watch("variants");
  const { data: location, isLoading: locationLoading } = useGetInventoryLocations();

  const locationOption = useMemo(() => {
    return location?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [location]);

  const { data, isLoading, refetch } = useGetProductDetail(id as string);

  const handleLocationChange = (index: number, selectedLocations: any[]) => {
    const currentVariant = variants?.[index];
    const currentInventory = currentVariant?.inventory ?? [];

    // Create new inventory array based on selected locations
    const updatedInventory = selectedLocations.map((loc) => {
      // Keep existing stock_total value if location was already selected
      const existingInventory = currentInventory.find((inv: any) => inv.location_id === loc.value);
      return {
        location_id: loc.value,
        stock_total: existingInventory?.stock_total || "",
      };
    });

    // Update both location and inventory in the form
    methods.setValue(`variants.${index}.location`, [...selectedLocations]);
    methods.setValue(`variants.${index}.inventory`, updatedInventory);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        variants: data?.variants?.map((item) => ({
          variant_name: item.variant_name,
          sku: item.sku,
          price_idr: parseInt(item.price_idr),
          inventory: item.inventory?.map((item) => ({
            location_id: item.location_id,
            stock_total: parseInt(item.stock_total),
          })),
        })),
      };
      const res = await mutateAsync({ data: payload, id: id as string });
      if (res) {
        console.log(res);
        refetch();
        setOpenAddVariant(false);
        methods.reset();
      }
    } catch (error) {
      console.log(error);
    }
  });
  const handleOpenManageStock = (variant: IProductVariantItem) => {
    setSelectedVariant(variant);
    setOpenManageStock(true);
    console.log(variant)
  };



  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

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
                      {i === 0 && <div className="absolute bottom-2 right-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium">COVER</div>}
                    </div>
                  ))}
              </div>
              <Divider className="my-2" />
              <div className="flex flex-col gap-2 text-sm">
                {/* <p className="font-semibold text-sm">Product Variant </p> */}

                <div className="space-y-3">
                  <div className="flex flex-row w-full justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Package size={20} />
                      Variants & Inventory
                    </h2>
                    <div>
                      <Button
                        onClick={() => {
                          setOpenAddVariant(true);
                        }}
                      >
                        <Plus />
                        Add Variants
                      </Button>
                    </div>
                  </div>
                  {data?.data?.variants?.map((v) => (
                    <InventoryCardComponent variant={v} key={v.id} onOpenVariant={handleOpenManageStock} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {openAddVariant &&
        <BaseDialogComponent
          title="Add Variant"
          isOpen={openAddVariant}
          btnConfirm="Submit"
          onClose={() => {
            setOpenAddVariant(false);
            methods.reset();
          }}
          onCloseText="Cancel"
          onConfirm={onSubmit}
        >
          <div className="flex flex-col gap-2">
            <div className="grid  gap-4">
              <FormProvider {...methods}>
                <form className="grid  gap-4">
                  {fields?.map((field, index) => (
                    <Fragment key={field.id}>
                      <Card className="w-full">
                        <CardHeader className="text-lg font-semibold">
                          <div className="flex flex-row items-center justify-between">
                            <p className="text-lg font-semibold">#{index + 1}</p>

                            <div className="flex">
                              <Button
                                className="h-8 w-8"
                                size={"sm"}
                                variant={"destructive"}
                                onClick={() => {
                                  if (fields.length > 1) {
                                    remove(index);
                                  } else {
                                    remove(index);
                                    append({ ...defaultValuesVariant });
                                  }
                                }}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={control}
                              name={`variants.${index}.variant_name`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                    Variant Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                                      placeholder="Type here.."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={control}
                              name={`variants.${index}.sku`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                    SKU
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                                      placeholder="Type here.."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name={`variants.${index}.price_idr`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                    Price
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                                      placeholder="Type here.."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Branch Selection */}
                            <FormField
                              control={control}
                              name={`variants.${index}.location`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                    Branch
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      defaultValue={field.value || []}
                                      options={locationOption}
                                      isLoading={locationLoading}
                                      className="basic-multi-select"
                                      classNames={{
                                        control: () =>
                                          "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                                        placeholder: () => "placeholder-gray-400",
                                        singleValue: () => "text-brand-999",
                                        input: () => "text-brand-999 bg-none",
                                      }}
                                      isMulti
                                      onChange={(selectedOptions: any) => {
                                        handleLocationChange(index, selectedOptions);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Dynamic Stock Inputs based on selected locations */}
                            {(variants?.length as number) > 0 ? (
                              <>
                                {variants?.[index]?.inventory && variants[index].inventory.length > 0 && (
                                  <div className="col-span-2">
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-brand-999">Stock per Branch</p>
                                      {variants[index].inventory.map((inventoryItem: any, inventoryIndex: number) => {
                                        // Find location name for display
                                        const locationName =
                                          locationOption?.find((loc: any) => loc.value === inventoryItem.location_id)?.label ||
                                          inventoryItem.location_id;

                                        return (
                                          <FormField
                                            key={`${index}-inventory-${inventoryIndex}`}
                                            control={control}
                                            name={`variants.${index}.inventory.${inventoryIndex}.stock_total`}
                                            render={({ field }) => (
                                              <FormItem className="flex flex-col">
                                                <FormLabel className="text-brand-999 font-medium text-sm">Stock - {locationName}</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                                                    placeholder="Enter stock quantity"
                                                    {...field}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      {index >= fields.length - 1 && (
                        <div className="flex justify-end w-full">
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              append({ ...defaultValuesVariant });
                            }}
                          >
                            <Plus />
                            Add More
                          </Button>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </form>
              </FormProvider>
            </div>
          </div>
        </BaseDialogComponent>
      }
      {openManageStock &&
        <ManageStockDialog
          isOpen={openManageStock}
          onClose={() => {
            setOpenManageStock(false);
            setSelectedVariant(null);
          }}
          selectedVariant={selectedVariant}
          onSuccess={refetch}

        />
      }
    </div >
  );
};

interface IProps {
  variant: IProductVariantItem;
  onOpenVariant: (data: IProductVariantItem) => void;
}

export const InventoryCardComponent = ({ variant, onOpenVariant }: IProps) => {
  const [open, setOpen] = useState(false);
  const getStockStatus = (available: number, total: number) => {
    if (available === 0) return "bg-red-500/10 text-red-400";
    if (available < total * 0.25) return "bg-yellow-500/10 text-yellow-400";
    return "bg-emerald-500/10 text-emerald-400";
  };

  const getStatusBadge = (available: number, total: number) => {
    if (available === 0) return "Out of Stock";
    if (available < total * 0.25) return "Low Stock";
    return "In Stock";
  };

  return (
    <div key={variant.id} className="border border-border rounded-lg overflow-hidden bg-card transition-colors">
      {/* Accordion Header */}
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <ChevronDown size={20} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
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
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatus(variant.stock_available, variant.stock_total)}`}>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Stock</p>
              <p className="text-xl font-bold text-foreground">{variant.stock_total}</p>
            </div>
            <div className="bg-card rounded border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Available</p>
              <p className="text-xl font-bold text-emerald-400">{variant.stock_available}</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-2">
            <div className="flex flex-row items-center gap-4 w-full justify-between">

              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin size={16} />
                Stock by Location
              </h4>
              <div><Button variant="secondary" size={"sm"} onClick={() => onOpenVariant(variant)}><Warehouse />Manage Stock</Button></div>

            </div>

            <div className="space-y-2">
              {variant.inventory.map((inv) => (
                <div key={inv.id} className="bg-card rounded border border-border p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{inv.location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.location.code}
                      {inv.location.is_active ? " • Active" : " • Inactive"}
                    </p>

                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold text-emerald-400">{inv.stock_available}</p>
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
  );
};
