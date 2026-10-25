"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { PhotoUploadForm, InlinePhotoCell } from "@/components/general/photo-upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Select as Selects, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetInventoryLocations, useGetProductCategories } from "@/hooks/api/queries/admin/products";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductFormValues, ProductFormSchema } from "@/resolver";
import { createFormData } from "@/lib/helper";
import { useCreateProduct } from "@/hooks/api/mutations/admin";
import Select, { MultiValue } from "react-select";

type ProductVariantFormValue = NonNullable<CreateProductFormValues["variants"]>[number];
type LocationOption = { value: string; label: string };

const defaultValuesVariant: ProductVariantFormValue = {
  variant_name: "",
  sku: "",
  price_idr: "",
  photos: [],
  inventory: [], // Array of { location_id, stock_total }
  location: [], // Array for multiple selections (temporary, not in final payload)
};

export const CreateProductPage = () => {
  const router = useRouter();
  const methods = useForm<CreateProductFormValues>({
    defaultValues: {
      category_id: "",
      name: "",
      description: "",
      photos: [],
      type: "buy",
      variants: [],
    },
    resolver: zodResolver(ProductFormSchema),
    mode: "all",
  });
  const { control, handleSubmit, watch } = methods;
  const { fields, append, remove } = useFieldArray({ name: "variants", control, keyName: "id" });
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });
  const { data: location, isLoading: locationLoading } = useGetInventoryLocations();

  const locationOption = useMemo(() => {
    return location?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [location]);

  const { mutateAsync } = useCreateProduct();

  const { data: categoryList } = useGetProductCategories({ page: 1, limit: 999 })

  // Watch the variants to track location changes
  const variants = watch("variants");

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Variant photo files travel outside the `variants` JSON (multipart keys
      // `variant_photos.<index>`); the URL input is gone, only files now.
      const variantPhotoFiles: { index: number; file: File }[] = [];
      const variants = data?.variants?.map((item, index) => {
        const photoFile = (item.photos as { file?: File }[] | undefined)?.[0]?.file;
        if (photoFile instanceof File) variantPhotoFiles.push({ index, file: photoFile });
        return {
          price_idr: parseInt(item.price_idr),
          variant_name: item.variant_name,
          sku: item?.sku,
          inventory: item.inventory?.map((i) => ({
            location_id: i.location_id,
            stock_total: parseInt(i.stock_total),
          })),
        };
      });
      const temp = {
        ...data,
        is_rentable: data?.type === "rent",
        photos: data?.photos,
        variants,
      };
      const payload = createFormData(temp);
      variantPhotoFiles.forEach(({ index, file }) => payload.append(`variant_photos_${index}`, file));
      const res = await mutateAsync(payload);
      if (res) {
        handleOpenModal("SUCCESS");
      }
    } catch (e) {
      console.log(e);
    }
  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };

  // Helper function to update inventory array when locations change
  const handleLocationChange = (index: number, selectedLocations: MultiValue<LocationOption>) => {
    const currentVariant = variants?.[index];
    const currentInventory = currentVariant?.inventory ?? [];

    // Create new inventory array based on selected locations
    const updatedInventory = selectedLocations.map((loc) => {
      // Keep existing stock_total value if location was already selected
      const existingInventory = currentInventory.find((inv) => inv.location_id === loc.value);
      return {
        location_id: loc.value,
        stock_total: existingInventory?.stock_total || "",
      };
    });

    // Update both location and inventory in the form
    methods.setValue(`variants.${index}.location`, [...selectedLocations]);
    methods.setValue(`variants.${index}.inventory`, updatedInventory);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Create New Product</h3>
        <p className="text-sm text-gray-500">Fill in the product details to add it to your catalog.</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader className="font-medium">Product Information</CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Name
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
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Product Category
                      </FormLabel>
                      <FormControl>
                        <Selects
                          {...field}
                          value={field.value}
                          defaultValue={field.value}
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                            <SelectValue placeholder="Select Category" className="!text-gray-400" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {categoryList?.data?.map((item) => (
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
                <FormField
                  control={control}
                  name="type"
                  defaultValue={"buy"}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Product Type
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue="buy"
                          value={field.value}
                          className="flex flex-row gap-3 items-center"
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="buy" id="place" />
                            <Label htmlFor="r1" className="text-brand-999">
                              For Sell
                            </Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="rent" id="place" />
                            <Label htmlFor="r1" className="text-brand-999">
                              For Rent
                            </Label>
                          </div>
                        </RadioGroup>
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
                    <FormLabel className=" text-brand-999 font-medium text-sm" required>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        placeholder="Type here.."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <PhotoUploadForm name="photos" maxPhotos={1} label="Cover Photo (1 max)" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="font-medium">
              <div className="flex flex-row items-center w-full justify-between">
                <div>
                  <h3>Product Variant</h3>
                  <p className="text-xs text-gray-500">Fill one row per variant — everything is created in a single save.</p>
                </div>
                <div className="flex">
                  <Button size={"sm"} variant={"secondary"} onClick={() => append({ ...defaultValuesVariant })}>
                    <Plus /> Add Variant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {fields?.length > 0 && (
                  <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_130px_1.6fr_56px_36px] gap-2 px-1 text-xs font-medium text-gray-500">
                    <span>Variant Name</span>
                    <span>SKU</span>
                    <span>Price (IDR)</span>
                    <span>Branch</span>
                    <span>Photo</span>
                    <span />
                  </div>
                )}
                {fields?.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                    <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_130px_1.6fr_56px_36px] gap-2 items-center">
                      <FormField
                        control={control}
                        name={`variants.${index}.variant_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                placeholder="e.g. Blue / Size M"
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
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                placeholder="SKU code"
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
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[38px]"
                                placeholder="250000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`variants.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                defaultValue={field.value || []}
                                options={locationOption}
                                isLoading={locationLoading}
                                classNamePrefix="bulk-variant-select"
                                classNames={{
                                  control: () =>
                                    "!min-h-[38px] !border-2 !border-gray-200 !rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-colors !bg-transparent",
                                  placeholder: () => "text-gray-400 text-sm",
                                  singleValue: () => "text-brand-999 text-sm",
                                  input: () => "text-brand-999 text-sm",
                                }}
                                isMulti
                                onChange={(selectedOptions: MultiValue<LocationOption>) => {
                                  handleLocationChange(index, selectedOptions);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <InlinePhotoCell name={`variants.${index}.photos`} />
                      <Button
                        type="button"
                        className="h-9 w-9 shrink-0 justify-self-center"
                        size={"sm"}
                        variant={"destructive"}
                        onClick={() => remove(index)}
                        aria-label={`Remove variant ${index + 1}`}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                    {/* Stock chips: one compact input per selected branch */}
                    {variants?.[index]?.inventory && variants[index].inventory.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Stock:</span>
                        {variants[index].inventory.map((inventoryItem, inventoryIndex: number) => {
                          const locationName =
                            locationOption?.find((loc: LocationOption) => loc.value === inventoryItem.location_id)?.label || inventoryItem.location_id;
                          return (
                            <div key={`${index}-inventory-${inventoryIndex}`} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md pl-2 pr-1 py-0.5">
                              <span className="text-xs text-brand-999 whitespace-nowrap">{locationName}</span>
                              <FormField
                                control={control}
                                name={`variants.${index}.inventory.${inventoryIndex}.stock_total`}
                                render={({ field }) => (
                                  <FormItem className="m-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-20 h-7 px-2 border border-gray-200 rounded text-sm text-gray-999 focus:outline-none focus:border-brand-500 transition-colors"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Select branch(es) above to enter stock per location.</p>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant={"outline"}
                  className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-brand-500 hover:text-brand-500"
                  onClick={() => append({ ...defaultValuesVariant })}
                >
                  <Plus /> Add another variant
                </Button>
                <p className="text-xs text-gray-500">Leave the photo empty to fall back to the cover photo publicly.</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex w-full justify-end items-center gap-2">
            <div className="">
              <Button variant={"secondary"} type="button" onClick={() => handleOpenModal("CANCEL")}>
                Cancel
              </Button>
            </div>
            <div className="">
              <Button type="submit" disabled={!methods.formState.isValid}>
                Create Product
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/products")}
          open={open.SUCCESS}
          title="Prodcut Created Successfully"
          subtitle="Your new product has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
            window.location.reload();
          }}
          cancelText="Product List"
          confirmText="Create More"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Product Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/products")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
