"use client";

import { CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { PhotoUploadForm } from "@/components/general/photo-upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BANK_LIST } from "@/constants/sample-data";
import { useCreateInstructor } from "@/hooks/api/mutations/admin";
import { DEFAULT_PASSWORD } from "@/lib/config";
import { Ellipsis, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";

export const CreateProductPage = () => {
  const router = useRouter();
  const methods = useForm();
  const { control, handleSubmit } = methods;
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const { mutateAsync } = useCreateInstructor();

  const onSubmit = handleSubmit(async (data) => {
    // try {
    //   const payload = {
    //     ...data,
    //     bank_name: data?.bank_name.label,
    //   };
    //   const res = await mutateAsync(payload);
    //   if (res) {
    //     handleOpenModal("SUCCESS");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };

  const variantHeaders = [
    {
      id: "variant_name",
      text: "Variant Name",
      value: "variant_name",
    },
    {
      id: "variant_desc",
      text: "Variant Description",
      value: "variant_desc",
    },
  ];

  const headers = [
    {
      id: "variant_name",
      text: "Variant Name",
      value: "variant_name",
    },
    {
      id: "variant_desc",
      text: "Variant Description",
      value: "variant_desc",
    },
  ];

  const variantAction = {
    text: "Action",
    show: true,
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              // edit variant row
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className=""
            onClick={() => {
              // delete row variant
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
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
            <CardHeader className="font-medium">Basic Information</CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={control}
                  name="full_name"
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
                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          type="email"
                          {...field}
                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm">WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          {...field}
                          // className="w-auto min-w-[388px]"
                        />
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
            <CardHeader>
              <div className="flex flex-row items-center w-full justify-between">
                <h2 className="text-lg font-semibold mb-4">Variants</h2>
                <div className="flex">
                  <Button
                    size={"sm"}
                    variant={"outline"}
                    onClick={() => {
                      // add popup to add  variants
                    }}
                  >
                    <Plus />
                    Add Variant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CustomTable headers={variantHeaders} actionOptions={variantAction} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center w-full justify-between">
                <h2 className="text-lg font-semibold mb-4">Detail Variant & Pricing</h2>
              </div>
            </CardHeader>
            <CardContent>
              <CustomTable headers={variantHeaders} actionOptions={variantAction} />
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
          onCancel={() => router.push("/admin/instructor")}
          open={open.SUCCESS}
          title="Product Created Successfully"
          subtitle="Your new instructor has been successfully added."
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
          title="Instructor Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/instructor")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
