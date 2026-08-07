"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLocation } from "@/hooks/api/mutations/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export const locationFormSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  maps_url: z.union([z.url(), z.literal("")]),
  is_active: z.boolean(),
});

export type ILocationFormValues = z.infer<typeof locationFormSchema>;

const defaultValues: ILocationFormValues = {
  name: "",
  address: "",
  maps_url: "",
  is_active: true,
};

export const CreateLocationPage = () => {
  const router = useRouter();
  const methods = useForm<ILocationFormValues>({ defaultValues, resolver: zodResolver(locationFormSchema) });
  const { control, handleSubmit } = methods;
  const { mutateAsync } = useCreateLocation();
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(data);
      if (res) {
        methods.reset();
        handleOpenModal("SUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="text-2xl text-brand-999 font-semibold">Create New Location</h3>
        <p className="text-sm text-gray-500">Fill in the information to create a new location</p>
      </div>

      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center text-sm font-semibold">Location Information</CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Location Name
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
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Address
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
                <FormField
                  control={control}
                  name="maps_url"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm">Maps URL</FormLabel>
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row w-full justify-between items-center">
                      <div className="flex flex-col gap-2">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Active
                        </FormLabel>
                        <FormDescription>Enable if this location is available for booking</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row items-center gap-2 mt-4 justify-end">
                <div className="">
                  <Button variant={"secondary"} type="button" onClick={() => handleOpenModal("CANCEL")}>
                    Cancel
                  </Button>
                </div>
                <div className="">
                  <Button type="submit" disabled={!methods.formState.isValid}>
                    Create Location
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/locations")}
          open={open.SUCCESS}
          title="Success!"
          subtitle="Your new location has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
          }}
          cancelText="Location List"
          confirmText="Create More"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Location Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/locations")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
