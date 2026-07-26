"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { PhotoUploadForm } from "@/components/general/photo-upload-form";
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

type ProductLocationOption = {
  value: string;
  label: string;
};

type ProductVariantFormValue = NonNullable<CreateProductFormValues["variants"]>[number];

const defaultValuesVariant: ProductVariantFormValue = {
  variant_name: "",
  sku: "",
  price_idr: '',
  inventory: [],  // Array of { location_id, stock_total }
  location: []  // Array for multiple selections (temporary, not in final payload)
}



export const CreateProductPage = () => {
  const router = useRouter();
  const methods = useForm<CreateProductFormValues>({
    defaultValues: {
      category_id: "",
      name: "",
      description: "",
      photos: [],
      type: 'buy',
      variants: [],
    },
    resolver: zodResolver(ProductFormSchema),
    mode: 'all',
  });
  const { control, handleSubmit, watch } = methods;
  const { fields, append, remove } = useFieldArray({ name: 'variants', control, keyName: 'id' })
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });
  const { data: location, isLoading: locationLoading } = useGetInventoryLocations()

  const locationOption = useMemo<ProductLocationOption[]>(() => {
    return location?.data?.map((item) => ({
      value: item.id,
      label: item.name
    })) ?? [];
  }, [location])

  const { mutateAsync } = useCreateProduct()

  const [category, setCategory] = useState("")
  const { data: categoryList } = useGetProductCategories({ page: 1, limit: 999 })

  // Watch the variants to track location changes
  const variants = watch('variants');

  const onSubmit = handleSubmit(async (data) => {



    try {
      const variants = data?.variants?.map((item) => ({
        price_idr: parseInt(item.price_idr),
        variant_name: item.variant_name,
        sku: item?.sku,
        inventory: item.inventory?.map((i) => ({
          location_id: i.location_id,
          stock_total: parseInt(i.stock_total)
        }))
      }))
      const temp = {
        ...data,
        is_rentable: data?.type === 'rent',
        photos: data?.photos,
        variants,
      }
      const payload = createFormData(temp)
      // console.log(tem

      // console.log("📤 FormData entries:");
      // for (const [key, value] of payload.entries()) {
      //   if (key === "photos") {
      //     console.log(`${key}:`, value instanceof File ? `✅ File (${(value as File).name})` : `❌ Not a file: ${typeof value}`);
      //   } else {
      //     console.log(`${key}:`, typeof value === "string" && value.length > 100 ? value.substring(0, 50) + "..." : value);
      //   }
      // }
      const res = await mutateAsync(payload)
      if (res) {
        handleOpenModal('SUCCESS')
      }

    } catch (e) {
      console.log(e)
    }




  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };

  // Helper function to update inventory array when locations change
  const handleLocationChange = (index: number, selectedLocations: MultiValue<ProductLocationOption>) => {
    const currentVariant = variants?.[index]
    const currentInventory = currentVariant?.inventory ?? [];

    // Create new inventory array based on selected locations
    const updatedInventory = selectedLocations.map((loc) => {
      // Keep existing stock_total value if location was already selected
      const existingInventory = currentInventory.find((inv) => inv.location_id === loc.value);
      return {
        location_id: loc.value,
        stock_total: existingInventory?.stock_total || ''
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
                            setCategory(e)
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
                <PhotoUploadForm name="photos" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="font-medium"><div className="flex flex-row items-center w-full justify-between">
              <h3>Product Variant</h3>
              <div className="flex">
                <Button size={'sm'} variant={'secondary'} onClick={() => append({ ...defaultValuesVariant })}><Plus /> Add Variant</Button>
              </div>
            </div></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {fields?.map((field, index) =>
                  <Card key={field.id}>
                    <CardHeader className="text-lg font-semibold"><div className="flex flex-row items-center justify-between">
                      <p className="text-lg font-semibold">#{index + 1}</p>
                      <div className="flex">
                        <Button className="h-8 w-8" size={'sm'} variant={'destructive'} onClick={() => remove(index)}><Trash /></Button>
                      </div>
                    </div></CardHeader>
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
                                  onChange={(selectedOptions) => {
                                    handleLocationChange(index, selectedOptions);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Dynamic Stock Inputs based on selected locations */}
                        {variants?.length as number > 0 ? <>
                          {variants?.[index]?.inventory && variants[index].inventory.length > 0 && (
                            <div className="col-span-2">
                              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-brand-999">Stock per Branch</p>
                                {variants[index].inventory.map((inventoryItem, inventoryIndex) => {
                                  // Find location name for display
                                  const locationName = locationOption?.find(
                                    (loc) => loc.value === inventoryItem.location_id
                                  )?.label || inventoryItem.location_id;

                                  return (
                                    <FormField
                                      key={`${index}-inventory-${inventoryIndex}`}
                                      control={control}
                                      name={`variants.${index}.inventory.${inventoryIndex}.stock_total`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="text-brand-999 font-medium text-sm">
                                            Stock - {locationName}
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
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
                          )}</> : <></>}


                      </div>
                    </CardContent>
                  </Card>
                )}
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
            window.location.reload()
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
