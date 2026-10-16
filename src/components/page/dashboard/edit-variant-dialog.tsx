"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateVariantDetail } from "@/hooks/api/mutations/admin";
import { UpdateVariantFormValues, UpdateVariantSchema } from "@/resolver";
import { IProductVariantItem } from "@/types/product.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface EditVariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: IProductVariantItem | null;
  isManager?: boolean;
  onSuccess?: () => void;
}

export const EditVariantDialog = ({ isOpen, onClose, variant, onSuccess }: EditVariantDialogProps) => {
  const { mutateAsync } = useUpdateVariantDetail();
  const methods = useForm<UpdateVariantFormValues>({
    resolver: zodResolver(UpdateVariantSchema),
    mode: "all",
  });
  const { control, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isOpen && variant) {
      reset({
        variant_name: variant.variant_name,
        sku: variant.sku,
        price_idr: String(variant.price_idr),
        is_active: variant.is_active,
      });
    }
  }, [isOpen, variant, reset]);

  // ponytail: stock never sent here — BE rejects it, use Manage Stock instead
  const onSubmit = handleSubmit(async (data) => {
    if (!variant) return;
    try {
      await mutateAsync({
        id: variant.product_id,
        idVar: variant.id,
        data: {
          variant_name: data.variant_name,
          sku: data.sku,
          price_idr: parseInt(data.price_idr),
          ...(data.is_active !== undefined ? { is_active: data.is_active } : null),
        },
      });
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
            <FormField
              control={control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="text-brand-999 font-medium text-sm">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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
