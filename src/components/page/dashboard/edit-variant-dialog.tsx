/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetInventoryLocations } from "@/hooks/api/queries/admin/products";
import { useUpdateVariantDetail } from "@/hooks/api/mutations/admin";
import { UpdateVariantFormValues, UpdateVariantSchema } from "@/resolver";
import { IProductVariantItem } from "@/types/product.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";

interface EditVariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: IProductVariantItem | null;
  isManager: boolean;
  onSuccess?: () => void;
}

type LocationOption = { value: string; label: string };

export const EditVariantDialog = ({ isOpen, onClose, variant, isManager, onSuccess }: EditVariantDialogProps) => {
  const { mutateAsync } = useUpdateVariantDetail();
  const { data: location, isLoading: locationLoading } = useGetInventoryLocations();
  const methods = useForm<UpdateVariantFormValues>({
    resolver: zodResolver(UpdateVariantSchema),
    mode: "all",
  });
  const { control, handleSubmit, watch, setValue, reset } = methods;
  const variants = watch("inventory");

  const locationOption: LocationOption[] = useMemo(() => {
    return (location?.data ?? []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [location]);

  useEffect(() => {
    if (isOpen && variant) {
      const inventory = (variant.inventory ?? []).map((inv) => ({
        location_id: inv.location_id,
        stock_total: inv.stock_total ?? 0,
      }));
      reset({
        variant_name: variant.variant_name,
        sku: variant.sku,
        price_idr: String(variant.price_idr),
        inventory,
        location: inventory.map((item) => ({
          value: item.location_id,
          label: locationOption?.find((loc) => loc.value === item.location_id)?.label ?? item.location_id,
        })),
      });
    }
  }, [isOpen, variant, reset, locationOption]);

  const handleLocationChange = (selectedLocations: any[]) => {
    const currentInventory = variants ?? [];
    const updatedInventory = selectedLocations.map((loc) => {
      const existingInventory = currentInventory.find((inv: any) => inv.location_id === loc.value);
      return {
        location_id: loc.value,
        stock_total: existingInventory?.stock_total ?? 0,
      };
    });
    setValue("location", [...selectedLocations]);
    setValue("inventory", updatedInventory);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!variant) return;
    try {
      const payload: any = {
        variant_name: data.variant_name,
        sku: data.sku,
        price_idr: parseInt(data.price_idr),
      };
      if (isManager) {
        payload.inventory = data.inventory?.map((item) => ({
          location_id: item.location_id,
          stock_total: parseInt(String(item.stock_total ?? 0)),
        }));
      }
      await mutateAsync({ id: variant.product_id, idVar: variant.id, data: payload });
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseDialogComponent
      title={`Edit Variant - ${variant?.variant_name ?? ""}`}
      isOpen={isOpen}
      btnConfirm="Save Changes"
      onClose={handleClose}
      onCloseText="Cancel"
      onConfirm={onSubmit}
    >
      <FormProvider {...methods} >
        <form className="flex flex-col gap-4 font-sans">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="variant_name"
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
              name="sku"
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
              name="price_idr"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                      placeholder="Type here.."
                      type="number"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isManager && (
            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm">
                    Branch
                  </FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value || []}
                      value={field.value || []}
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
                        handleLocationChange(selectedOptions);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-brand-999 mb-2">Stock Information (Managed via Manage Stock)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Stock</p>
                <p className="font-semibold">{variant?.stock_total ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <p className="font-semibold text-emerald-600">{variant?.stock_available ?? 0}</p>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </BaseDialogComponent>
  );
};