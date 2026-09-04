"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClassSession } from "@/hooks/api/mutations/admin";
import { useAdminPermission } from "@/hooks/use-role-access";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  class_name: "",
  class_description: "",
  allow_credit: true,
  cancellation_fee_idr: 75000,
};
export const AddClassPageView = () => {
  const router = useRouter();
  const { isManager } = useAdminPermission();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const { mutateAsync } = useCreateClassSession();
  // const [open, setOpen] = useState(false);
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };
  const onSubmit = handleSubmit(async (data) => {
    try {
      const rawFee = (data as unknown as { cancellation_fee_idr: unknown }).cancellation_fee_idr;
      const payload = {
        ...data,
        cancellation_fee_idr: rawFee === "" || rawFee === undefined ? 75000 : Number(rawFee),
        is_active: true,
      } as typeof data & { is_active: boolean; cancellation_fee_idr: number };
      if (!isManager) delete (payload as Record<string, unknown>).cancellation_fee_idr;
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res.data);
        methods.reset();
        // router.push("/admin/class");
        handleOpenModal("SUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });
  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="text-2xl text-brand-999 font-semibold">Create New Class</h3>
        <p className="text-sm text-gray-500">Fill in the information to create a new class</p>
      </div>

      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center text-sm font-semibold">Class Information</CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={control}
                    name="class_name"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Class Name
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
                    name="class_description"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Class Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
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
                    name="allow_credit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-col gap-2">
                          <FormLabel className=" text-brand-999 font-medium text-sm" required>
                            Allow Credit
                          </FormLabel>
                          <FormDescription>Enable if this class can be booked with credits</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="cancellation_fee_idr"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm">Cancellation Fee (IDR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            placeholder="75000"
                            disabled={!isManager}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px] disabled:opacity-50"
                          />
                        </FormControl>
                        <FormDescription>
                          {isManager
                            ? "0 = no penalty even within 6h. Charged via Midtrans when member cancels within 6h and wants credit back."
                            : "Only manager can edit this field."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-row items-center gap-2 mt-4 justify-end">
                  <div className="">
                    <Button variant={"secondary"} type="button">
                      Cancel
                    </Button>
                  </div>
                  <div className="">
                    <Button>Create Class</Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </CardContent>
      </Card>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/class")}
          open={open.SUCCESS}
          title="Success!"
          subtitle="Your new class category has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
          }}
          cancelText="Class Category List"
          confirmText="Create More"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Class Category Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/class")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
