"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BANK_LIST } from "@/constants/sample-data";
import { useEditInstructor } from "@/hooks/api/mutations/admin";
import { useGetInstructorDetail } from "@/hooks/api/queries/admin/instructor";
import { DEFAULT_PASSWORD } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";

const defaultValues = {
  full_name: "",
  email: "",
  // password:''
  phone: "",
  bank_name: {
    label: "",
    value: "",
  },
  bank_account_number: "",
  password: DEFAULT_PASSWORD,
};

export const EditInstructorPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetInstructorDetail(id as string);

  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });
  const { mutateAsync } = useEditInstructor();

  const values = useMemo(() => {
    if (!data?.data) return defaultValues;
    return {
      full_name: data?.data?.full_name,
      email: data?.data?.email,
      phone: data?.data?.phone,
      bank_name: {
        label: data?.data?.bank_name,
        value: "",
      },
      bank_account_number: data?.data?.bank_account_number,
    };
  }, [data]);

  const methods = useForm({ defaultValues, values });
  const { control, handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        bank_name: data?.bank_name.label,
      };
      const res = await mutateAsync({ data: payload, id: id as string });
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
        <h3 className="text-2xl font-semibold">Create Instructor</h3>
        <p className="text-sm text-gray-500">Fill in the instructor’s details to add them to your schedule.</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader>Basic Information</CardHeader>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Payment Information</CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm">Bank Name</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          options={BANK_LIST as never}
                          className="basic-multi-select "
                          getOptionValue={(option) => `${option["label"]}`}
                          classNames={{
                            control: () =>
                              "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                            placeholder: () => "placeholder-gray-400",
                            singleValue: () => "text-brand-999",
                            input: () => "text-brand-999 bg-none",
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm">Account Number</FormLabel>
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
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader></CardHeader>
            <CardContent></CardContent>
          </Card> */}
          <div className="flex w-full justify-end items-center gap-2">
            <div className="">
              <Button variant={"secondary"} type="button" onClick={() => handleOpenModal("CANCEL")}>
                Cancel
              </Button>
            </div>
            <div className="">
              <Button type="submit" disabled={!methods.formState.isValid}>
                Edit Instructor
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-edit"
          onCancel={() => router.push("/admin/instructor")}
          open={open.SUCCESS}
          title="Instructor Updated Successfully"
          subtitle="The instructor has been successfully updated."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
            router.push(`/admin/instructor/${id}`);
          }}
          hideCancel
          cancelText="Instructor List"
          confirmText="Ok"
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
