"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { InstructorPaymentModelForm } from "@/components/page/instructor-payment/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BANK_LIST } from "@/constants/sample-data";
import { useCreateInstructor } from "@/hooks/api/mutations/admin";
import { DEFAULT_PASSWORD } from "@/lib/config";
import { ICreateIntructorPayload, IFormValuesAddInstructor, IModelParams, IPaymentRule } from "@/types/instructor.interface";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";

const defaultValues: IFormValuesAddInstructor = {
  full_name: "",
  email: "",
  // password:''
  phone: "",
  bank_name: {
    label: "",
    value: "",
  },
  description: "",
  bank_account_number: "",
  regular: {},
  reg_online: {},
  private: {},
  // {
  //   session_type: "private",
  //   session_place: null,
  //   payment_model: "",
  //   model_params: {},
  // },
  special: {},
  // {
  //   session_type: "special",
  //   session_place: null,
  //   payment_model: "",
  //   model_params: {},
  // },
  password: DEFAULT_PASSWORD,
};

export const PAYMENT_MODELS = [
  {
    name: "Regular Offline",
    value: "regular",
  },
  {
    name: "Regular Online",
    value: "reg_online",
  },
  {
    name: "Private",
    value: "private",
  },
  {
    name: "Special",
    value: "special",
  },
];

export const CreateInstructorPage = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const { mutateAsync } = useCreateInstructor();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = transformFormToPayload(data);
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
        <h3 className="text-2xl font-semibold">Create Instructor</h3>
        <p className="text-sm text-gray-500">Fill in the instructor’s details to add them to your schedule.</p>
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
            <CardHeader className="font-medium">Payment Models</CardHeader>
            <CardContent>
              {PAYMENT_MODELS.map((item) => (
                <InstructorPaymentModelForm key={item.value} label={item.name} prefix={item.value} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="font-medium">Payment Information</CardHeader>
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
                          classNames={{
                            control: () =>
                              "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                            placeholder: () => "placeholder-gray-400",
                            singleValue: () => "text-brand-999",
                            input: () => "text-brand-999 bg-none",
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            console.log(e);
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
                Create Instructor
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
          title="Instructor Created Successfully"
          subtitle="Your new instructor has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
          }}
          cancelText="Instructor List"
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

export function cleanModelParams(params?: IModelParams): IModelParams {
  if (!params) return {};

  const cleaned: IModelParams = {};

  Object.keys(params).forEach((key) => {
    const value = params[key as keyof IModelParams];
    if (value !== undefined && value !== null) {
      // Convert string to number
      const numValue = typeof value === "string" ? Number(value) : value;
      // Only include if it's a valid number
      if (!isNaN(numValue)) {
        cleaned[key as keyof IModelParams] = numValue;
      }
    }
  });

  return cleaned;
}

export function transformFormToPayload(formData: IFormValuesAddInstructor): ICreateIntructorPayload {
  const payload = {
    email: formData.email,
    full_name: formData.full_name,
    description: formData.description,
    bank_name: formData?.bank_name.label,
    phone: formData?.phone,
    bank_account_number: formData.bank_account_number,
    payment_rules: formData.payment_rules,
    password: formData?.password,
  };

  // Build payment_rules array
  const paymentRules: IPaymentRule[] = [];

  // Add regular (offline) if it has a payment_model
  if (formData.regular?.payment_model) {
    paymentRules.push({
      session_type: "regular",
      session_place: "offline",
      payment_model: formData.regular.payment_model,
      model_params: cleanModelParams(formData.regular.model_params || {}),
    });
  }

  // Add reg_online (regular online) if it has a payment_model
  if (formData.reg_online?.payment_model) {
    paymentRules.push({
      session_type: "regular",
      session_place: "online",
      payment_model: formData.reg_online.payment_model,
      model_params: cleanModelParams(formData.reg_online.model_params || {}),
    });
  }

  // Add private if it has a payment_model
  if (formData.private?.payment_model) {
    paymentRules.push({
      session_type: "private",
      session_place: null,
      payment_model: formData.private.payment_model,
      model_params: cleanModelParams(formData.private.model_params || {}),
    });
  }

  // Add special if it has a payment_model
  if (formData.special?.payment_model) {
    paymentRules.push({
      session_type: "special",
      session_place: null,
      payment_model: formData.special.payment_model,
      model_params: cleanModelParams(formData.special.model_params || {}),
    });
  }

  // Only add payment_rules if there are any
  if (paymentRules.length > 0) {
    payload.payment_rules = paymentRules;
  }

  return payload;
}
