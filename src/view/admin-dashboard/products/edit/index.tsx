"use client";

import { PhotoUploadForm, InlinePhotoCell } from "@/components/general/photo-upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select as Selects, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductCategories, useGetProductDetail } from "@/hooks/api/queries/admin/products";
import { useUpdateProduct, useUpdateVariantDetail } from "@/hooks/api/mutations/admin";
import { createFormData } from "@/lib/helper";
import { IProductVariantItem } from "@/types/product.interface";
import { UpdateProductFormSchema, UpdateProductFormValues } from "@/resolver";
import { toQuickEditRows, IQuickVariantEditRow } from "@/view/admin-dashboard/products/detail";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "next/navigation";

type PhotoItem = {
  id: string;
  file?: File;
  preview: string;
  isCover: boolean;
};

const fieldClass =
  "w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]";

export const ProductEditView = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const methods = useForm<UpdateProductFormValues>({
    resolver: zodResolver(UpdateProductFormSchema),
    mode: "all",
  });
  const variantMethods = useForm<{ variants: IQuickVariantEditRow[] }>({});

  const { control, handleSubmit, reset } = methods;
  const { mutateAsync: updateProductAsync } = useUpdateProduct();
  const { mutateAsync: updateVariantAsync } = useUpdateVariantDetail();
  const { data: categoryList } = useGetProductCategories({ page: 1, limit: 999 });
  const { data, isLoading, refetch } = useGetProductDetail(id);
  const categoryOption = useMemo(() => categoryList?.data ?? [], [categoryList]);
  const originals: IProductVariantItem[] = data?.data?.variants ?? [];

  useEffect(() => {
    if (!data?.data) return;
    // ponytail: cover model (BE) — merged total must be ≤1, extra legacy photos are sliced to [0]
    const photos: PhotoItem[] = (data.data.photos ?? []).slice(0, 1).map((url, idx) => ({
      id: `existing-${idx}`,
      preview: url,
      isCover: idx === 0,
    }));
    reset({
      name: data.data.name,
      category_id: data.data.category_id,
      description: data.data.description,
      photos,
      is_active: data.data.is_active,
      is_rentable: data.data.is_rentable,
    });
    variantMethods.reset(toQuickEditRows(data.data.variants ?? []));
  }, [data, reset, variantMethods]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const existingPhotos: string[] = [];
      const newPhotos: File[] = [];
      (values.photos as PhotoItem[] | undefined)?.forEach((photo) => {
        if (photo.file instanceof File) newPhotos.push(photo.file);
        else if (typeof photo.preview === "string") existingPhotos.push(photo.preview);
      });

      const payload = createFormData({
        name: values.name,
        category_id: values.category_id,
        description: values.description,
        existing_photos: existingPhotos,
        ...(values.is_active !== undefined ? { is_active: values.is_active } : null),
        ...(values.is_rentable !== undefined ? { is_rentable: values.is_rentable } : null),
      });
      newPhotos.forEach((file) => payload.append("photos", file));
      await updateProductAsync({ id, payload });

      // variant rows — same diff logic as the detail-page Quick Edit
      const rows = variantMethods.getValues().variants;
      await Promise.all(
        rows.map(async (row, index) => {
          const orig = originals[index];
          if (orig?.id !== row.id) return;
          const file = row.photos?.[0]?.file;
          if (file instanceof File) {
            const fd = new FormData();
            fd.append("variant_name", row.variant_name);
            fd.append("sku", row.sku);
            fd.append("price_idr", String(Number(row.price_idr)));
            fd.append("is_active", String(row.is_active));
            fd.append("photos", file);
            await updateVariantAsync({ id, idVar: row.id, data: fd });
            return;
          }
          const json: Record<string, unknown> = {};
          if (row.variant_name !== orig.variant_name) json.variant_name = row.variant_name;
          if ((row.sku ?? "") !== (orig.sku ?? "")) json.sku = row.sku || null;
          if (Number(row.price_idr) !== orig.price_idr) json.price_idr = Number(row.price_idr);
          if (row.is_active !== orig.is_active) json.is_active = row.is_active;
          if (!row.photos?.length && orig.photos?.[0]) json.photos = [];
          if (Object.keys(json).length > 0) {
            await updateVariantAsync({ id, idVar: row.id, data: json });
          }
        }),
      );

      await refetch();
      router.push(`/admin/products/${id}`);
    } catch (error) {
      console.log(error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Card className="rounded-lg border-brand-100">
            <CardHeader className="border-b border-brand-50">
              <div className="flex flex-col">
                <h3 className="text-brand-999 text-2xl font-semibold">Edit Product</h3>
                <p className="text-sm text-gray-500 font-normal">Update product details and variants in one place.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-brand-999 font-medium text-sm" required>
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input className={fieldClass} placeholder="Type here.." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-brand-999 font-medium text-sm" required>
                        Product Category
                      </FormLabel>
                      <FormControl>
                        <Selects value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={fieldClass}>
                            <SelectValue placeholder="Select Category" className="!text-gray-400" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {categoryOption.map((item) => (
                                <SelectItem value={item.id} key={item.id}>
                                  {item?.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Selects>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-4">
                    <FormLabel className="text-brand-999 font-medium text-sm" required>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea className={fieldClass} placeholder="Type here.." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <PhotoUploadForm name="photos" maxPhotos={1} label="Cover Photo (1 max)" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
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
                <FormField
                  control={control}
                  name="is_rentable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel className="text-brand-999 font-medium text-sm">For Rent</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-brand-100">
            <CardHeader className="font-medium">
              <div className="flex flex-row items-center w-full justify-between">
                <div>
                  <h3>Product Variants</h3>
                  <p className="text-xs text-gray-500">Edit one row per variant — everything is saved in a single save.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormProvider {...variantMethods}>
                <div className="flex flex-col gap-2">
                  {variantMethods.watch("variants")?.length > 0 && (
                    <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_130px_80px_56px] gap-2 px-1 text-xs font-medium text-gray-500">
                      <span>Variant Name</span>
                      <span>SKU</span>
                      <span>Price (IDR)</span>
                      <span>Active</span>
                      <span>Photo</span>
                    </div>
                  )}
                  {variantMethods.watch("variants")?.map((row, index) => (
                    <div key={row.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_130px_80px_56px] gap-2 items-center">
                        <FormField
                          control={variantMethods.control}
                          name={`variants.${index}.variant_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={variantMethods.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={variantMethods.control}
                          name={`variants.${index}.price_idr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={variantMethods.control}
                          name={`variants.${index}.is_active`}
                          render={({ field }) => (
                            <FormItem className="justify-self-center">
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <InlinePhotoCell name={`variants.${index}.photos`} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">
                    Stock and add/remove variant remain on the product detail page — inventory needs the movement endpoint.
                  </p>
                </div>
              </FormProvider>
            </CardContent>
          </Card>

          <div className="flex w-full justify-end items-center gap-2">
            <Button variant={"secondary"} type="button" onClick={() => router.push(`/admin/products/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!methods.formState.isValid}>
              Save Changes
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
