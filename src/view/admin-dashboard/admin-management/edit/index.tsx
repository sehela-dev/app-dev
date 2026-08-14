"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthAdmin } from "@/context/admin/admin-context";
import { useUpdateAdmin } from "@/hooks/api/mutations/admin";
import { useGetAdminDetail } from "@/hooks/api/queries/admin/admin-management/use-get-admin-detail";
import { useAdminPermission } from "@/hooks/use-role-access";
import { IUpdateAdminPayload } from "@/types/admin-management.interface";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface IEditAdminForm {
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role: "admin" | "manager";
  is_active: boolean;
  reason?: string;
}

const defaultValues: IEditAdminForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "admin",
  is_active: true,
  reason: "",
};

export const EditAdminPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuthAdmin();
  const { isManager } = useAdminPermission();
  const { data: profile, isLoading } = useGetAdminDetail(id as string);
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });
  const { mutateAsync, isPending } = useUpdateAdmin();

  const isSelf = useMemo(() => Boolean(profile && user?.profile?.id && profile.id === user.profile.id), [profile, user]);

  const values = useMemo(() => {
    if (!profile) return defaultValues;
    return {
      full_name: profile.full_name,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      password: "",
      role: profile.role,
      is_active: profile.is_active,
      reason: "",
    };
  }, [profile]);

  const methods = useForm({ defaultValues, values });
  const { control, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: IUpdateAdminPayload = {
        full_name: data.full_name,
        email: data.email,
        ...(data.phone ? { phone: data.phone } : null),
        ...(data.password ? { password: data.password } : null),
        ...(data.reason ? { reason: data.reason } : null),
      };
      if (isManager && !isSelf) {
        payload.role = data.role;
        payload.is_active = data.is_active;
      }
      const res = await mutateAsync({ id: id as string, data: payload });
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Edit Admin</h3>
        <p className="text-sm text-gray-500">Modify admin/manager account details.</p>
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
                      <FormLabel className=" text-brand-999 font-medium text-sm">Password</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Leave blank to keep current password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isManager && !isSelf && (
                  <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Role
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              </div>
              {isManager && !isSelf && (
                <div className="flex flex-col gap-2 pt-4">
                  <FormField
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                        <div className="flex flex-col">
                          <FormLabel className=" text-brand-999 font-medium text-sm">Account Status</FormLabel>
                          <span className="text-xs text-gray-500">{field.value ? "Active" : "Inactive"}</span>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="font-medium">Audit Trail</CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className=" text-brand-999 font-medium text-sm">Reason (optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        placeholder="Type the reason for this change..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-edit"
          onCancel={() => router.push(`/admin/admins/${id}`)}
          open={open.SUCCESS}
          title="Admin Updated Successfully"
          subtitle="The admin/manager account has been successfully updated."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
            router.push(`/admin/admins/${id}`);
          }}
          hideCancel
          cancelText="Admin List"
          confirmText="Ok"
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
