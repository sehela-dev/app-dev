"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { PhotoUploadForm } from "@/components/general/photo-upload-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select as Selects, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductCategories } from "@/hooks/api/queries/admin/products";
import { useUpdateProduct } from "@/hooks/api/mutations/admin";
import { createFormData } from "@/lib/helper";
import { UpdateProductFormValues, UpdateProductFormSchema } from "@/resolver";
import { IProductItemList } from "@/types/product.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProductItemList | null;
  onSuccess?: () => void;
}

type PhotoItem = {
  id: string;
  file?: File;
  preview: string;
  isCover: boolean;
};

export const EditProductDialog = ({ isOpen, onClose, product, onSuccess }: EditProductDialogProps) => {
  const methods = useForm<UpdateProductFormValues>({
    resolver: zodResolver(UpdateProductFormSchema),
    mode: "all",
  });
  const { control, handleSubmit, reset } = methods;
  const { mutateAsync } = useUpdateProduct();
  const { data: categoryList } = useGetProductCategories({ page: 1, limit: 999 });

  const categoryOption = useMemo(() => categoryList?.data ?? [], [categoryList]);

  useEffect(() => {
    if (isOpen && product) {
      const photos: PhotoItem[] = (product.photos ?? []).map((url, idx) => ({
        id: `existing-${idx}`,
        preview: url,
        isCover: idx === 0,
      }));
      reset({
        name: product.name,
        category_id: product.category_id,
        description: product.description,
        photos,
      });
    }
  }, [isOpen, product, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!product) return;
    try {
      const existingPhotos: string[] = [];
      const newPhotos: File[] = [];
      (data.photos as PhotoItem[] | undefined)?.forEach((photo) => {
        if (photo.file instanceof File) {
          newPhotos.push(photo.file);
        } else if (typeof photo.preview === "string") {
          existingPhotos.push(photo.preview);
        }
      });

      const payload = createFormData({
        name: data.name,
        category_id: data.category_id,
        description: data.description,
        existing_photos: existingPhotos,
      });
      newPhotos.forEach((file) => payload.append("photos", file));

      await mutateAsync({ id: product.id, payload });
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
      title="Edit Product"
      isOpen={isOpen}
      btnConfirm="Save Changes"
      onClose={handleClose}
      onCloseText="Cancel"
      onConfirm={onSubmit}
    >
      <FormProvider {...methods}>
        <form className="flex flex-col gap-4 font-sans">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="name"
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
              <FormItem className="flex flex-col">
                <FormLabel className=" text-brand-999 font-medium text-sm" required>
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="Type here.."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PhotoUploadForm name="photos" label="Photo Product (first photo is the cover)" />
        </form>
      </FormProvider>
    </BaseDialogComponent>
  );
};