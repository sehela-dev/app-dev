"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { InstructorPaymentModelForm } from "@/components/page/instructor-payment/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BANK_LIST } from "@/constants/sample-data";
import { useEditInstructor } from "@/hooks/api/mutations/admin";
import { useGetInstructorDetail } from "@/hooks/api/queries/admin/instructor";
import { DEFAULT_PASSWORD } from "@/lib/config";
import { IFormValuesAddInstructor, IInstructorDetails, IModelParams } from "@/types/instructor.interface";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";
import { transformFormToPayload } from "../create";

const defaultValues: IFormValuesAddInstructor = {
  full_name: "",
  email: "",

  phone: "",
  bank_name: {
    label: "",
    value: "",
  },
  description: "",
  bank_account_number: "",
  regular: null,
  reg_online: null,
  private: null,

  special: null,
};

const PAYMENT_MODELS = [
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
export function transformApiToFormValues(apiData: IInstructorDetails): IFormValuesAddInstructor {
  const formValues: IFormValuesAddInstructor = {
    full_name: apiData.full_name,
    email: apiData.email,
    phone: apiData.phone || "",
    description: apiData.description || "",
    bank_name: {
      label: apiData.bank_name || "",
      value: apiData.bank_name || "",
    },
    bank_account_number: apiData.bank_account_number || "",
    status: apiData.status,
    regular: {},
    reg_online: {},
    private: {},
    special: {},
  };

  // Define which fields are valid for each payment model
  const validFieldsByModel: Record<string, (keyof IModelParams)[]> = {
    percentage: ["percentage"],
    percentage_with_min: ["percentage", "min_amount", "min_threshold_people"],
    fixed: ["amount"],
    tiered: ["base_amount", "base_people", "additional_per_person"],
    source_based: ["credit_rate", "non_credit_rate"],
    per_person_with_min: ["per_person_amount", "min_amount"],
  };

  // Process payment rules if they exist
  if (apiData.payment_rules && apiData.payment_rules.length > 0) {
    apiData.payment_rules.forEach((rule) => {
      // Get valid fields for this payment model
      const validFields = validFieldsByModel[rule.payment_model] || [];

      // Convert number values to strings for form inputs, filtering by valid fields only
      const modelParams: Record<string, string> = {};
      if (rule.model_params) {
        validFields.forEach((field) => {
          const value = rule.model_params[field];
          if (value !== undefined && value !== null) {
            modelParams[field] = String(value);
          }
        });
      }

      const paymentRule = {
        payment_model: rule.payment_model,
        model_params: modelParams,
      };

      // Map to the correct form field based on session_type and session_place
      if (rule.session_type === "regular" && rule.session_place === "offline") {
        formValues.regular = paymentRule;
      } else if (rule.session_type === "regular" && rule.session_place === "online") {
        formValues.reg_online = paymentRule;
      } else if (rule.session_type === "private") {
        formValues.private = paymentRule;
      } else if (rule.session_type === "special") {
        formValues.special = paymentRule;
      }
    });
  }

  return formValues;
}

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
    return transformApiToFormValues(data?.data);
  }, [data?.data]);

  const methods = useForm({ defaultValues, values });
  const { control, handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = transformFormToPayload(data);
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Edit Instructor</h3>
        <p className="text-sm text-gray-500">Modify instructor’s details.</p>
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
