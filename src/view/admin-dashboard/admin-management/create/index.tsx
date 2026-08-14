"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAdmin } from "@/hooks/api/mutations/admin";
import { ICreateAdminPayload } from "@/types/admin-management.interface";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface ICreateAdminForm {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: "admin" | "manager";
}

const defaultValues: ICreateAdminForm = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
  role: "admin",
};

export const CreateAdminPage = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const { mutateAsync, isPending } = useCreateAdmin();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: ICreateAdminPayload = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
        ...(data.phone ? { phone: data.phone } : null),
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Create Admin</h3>
        <p className="text-sm text-gray-500">Fill in the account details to add a new admin or manager.</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader className="font-medium">Account Information</CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          type="email"
                          {...field}
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
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Min. 8 characters"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Role
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <Button type="submit" disabled={isPending}>
                Create Admin
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/admins")}
          open={open.SUCCESS}
          title="Admin Created Successfully"
          subtitle="Your new admin/manager account has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
          }}
          cancelText="Admin List"
          confirmText="Create More"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Admin Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/admins")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};