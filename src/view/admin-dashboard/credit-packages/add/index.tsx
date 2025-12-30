"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { useCreatePackage } from "@/hooks/api/mutations/admin";
import { Select, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { OPTION_TYPE } from "@/components/page/session/form";
import { useGetClassSessionsCategory } from "@/hooks/api/queries/admin/class-session";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/helper";
import { Loader2 } from "lucide-react";
import { ICreatePackagePayload, IPackageFormValues } from "@/types/credit-package.interface";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { useRouter } from "next/navigation";

const sessionType = [
  {
    value: "all",
    label: "Online & Offline",
  },
  {
    value: "online",
    label: "Online",
  },
  {
    value: "offline",
    label: "Offline",
  },
];

const defaultValues: IPackageFormValues = {
  name: "",
  credits: "",
  price_idr: "",
  validity_days: "",
  description: "",
  session_type_restriction: "all", //regular, private, special, or null
  place_restriction: "all", // offline, online, null
  class_ids_restriction: [], //specific class UUID or null
  package_type: "purchase",
  is_active: true,
};
export const AddCreditPacakgesPage = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const { mutateAsync } = useCreatePackage();

  const { data: clasCategory, isLoading: loadingCategory } = useGetClassSessionsCategory({ page: 1, limit: 999, status: "true", sort_by: "name" });
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const classCategoryOption = useMemo(() => {
    return clasCategory?.data?.map((item) => ({
      name: item.class_name,
      id: item.id,
    }));
  }, [clasCategory?.data]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: ICreatePackagePayload = {
        credits: parseInt(data?.credits),
        package_type: data?.package_type,
        description: data?.description,
        is_active: true,
        name: data?.name,
        price_idr: parseInt(data?.price_idr),
        validity_days: parseInt(data?.validity_days),
        class_ids_restriction: data?.class_ids_restriction,
        place_restriction: data?.place_restriction,
        session_type_restriction: data?.session_type_restriction,
      };

      const res = await mutateAsync(payload);
      if (res) {
        handleOpenModal("SUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };
  if (loadingCategory)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="text-2xl text-brand-999 font-semibold">Create Credit Package</h3>
        <p className="text-sm text-gray-500">Fill in the details to create a new credit package.</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <Card className="border-brand-100 w-full">
              <CardHeader className="flex flex-row text-lg w-full justify-between items-center font-semibold">Basic Information</CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 space-y-2">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Package Name
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
                    name="session_type_restriction"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Package Type
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                            {...field}
                          >
                            <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                              <SelectValue placeholder="Select Class Type" className="!text-gray-400" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value={"all"}>All</SelectItem>
                                {OPTION_TYPE.map((item) => (
                                  <SelectItem value={item.value} key={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="validity_days"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Valid for (days)
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
                    name="place_restriction"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Session Type
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                            {...field}
                          >
                            <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                              <SelectValue placeholder="Select Class Type" className="!text-gray-400" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {sessionType.map((item) => (
                                  <SelectItem value={item.value} key={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
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

            <Card className="border-brand-100 w-full">
              <CardHeader className="flex flex-row text-lg w-full justify-between items-center font-semibold">Package Detail</CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {" "}
                  <FormField
                    control={control}
                    name="price_idr"
                    rules={{
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers allowed",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                            placeholder="Rp"
                            {...field}
                            onChange={(e) => {
                              // Remove all non-numeric characters (including currency symbols and separators)
                              const numericValue = e.target.value.replace(/\D/g, "");
                              field.onChange(numericValue);
                            }}
                            onBlur={field.onBlur}
                            value={field.value ? formatCurrency(field.value) : ""}

                            // className="w-auto min-w-[388px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="credits"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Credit Amount
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
                    name="class_ids_restriction"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className=" text-brand-999 font-medium text-sm">Select Class</FormLabel>
                        <div className="grid  grid-cols-12 gap-2 spac border border-gray-400 rounded-md p-2">
                          {classCategoryOption?.map((option) => (
                            <FormItem key={option.id} className="flex items-center space-x-2 col-span-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(option?.id as string)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.id])
                                      : field.onChange(field.value.filter((value) => value !== option.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className=" text-brand-999 font-medium">{option.name}</FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                        <FormDescription className="text-brand-500 font-medium mt-2">*) You can select multiple classes at once</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-row items-center gap-2 mt-4 justify-end">
            <div className="">
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => {
                  if (methods.formState.isDirty) {
                    handleOpenModal("CANCEL");
                  } else {
                    router.push("/admin/credit-packages");
                  }
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="">
              <Button type="submit">Create Package</Button>
            </div>
          </div>
        </form>
      </FormProvider>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/credit-packages")}
          open={open.SUCCESS}
          title="Credit Package Created Successfully"
          subtitle="Your new credit package has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
          }}
          cancelText="Credit Package List"
          confirmText="Create More"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Credit Package Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/credit-packages")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
