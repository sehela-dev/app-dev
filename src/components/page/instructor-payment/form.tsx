"use client";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/helper";
import { useEffect } from "react";

const PAYMENT_MODELS = [
  {
    name: "Percentage",
    value: "percentage",
  },
  {
    name: "Percentage with Minimal Student",
    value: "percentage_with_min",
  },
  {
    name: "Fixed Rate",
    value: "fixed",
  },
  {
    name: "Tiered",
    value: "tiered",
  },
  {
    name: "Source Based",
    value: "source_based",
  },
  {
    name: "Per Person with Minimum Student",
    value: "per_person_with_min",
  },
];

interface IProps {
  prefix: string;
  label: string;
}

export const InstructorPaymentModelForm = ({ prefix, label }: IProps) => {
  const methods = useFormContext();

  const { control, watch, setValue } = methods;
  const regular = watch(prefix);
  const paymentModel = watch(`${prefix}.payment_model`);

  useEffect(() => {
    if (paymentModel) {
      setValue(`${prefix}.model_params`, {});
    }
  }, [paymentModel, prefix, setValue]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <FormField
          control={control}
          name={prefix}
          render={({ field }) => (
            <FormItem className="flex flex-row w-[250px] justify-between items-center pt-4">
              <div className="flex flex-col gap-2">
                <FormLabel className=" text-brand-999 font-medium text-lg">{label}</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {regular && (
          <div className="flex flex-col gap-2">
            <FormField
              control={control}
              name={`${prefix}.payment_model`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Payment Model
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
                          {PAYMENT_MODELS.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.name}
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
            {paymentModel === "percentage" && (
              <FormField
                control={control}
                name={`${prefix}.model_params.amount`}
                rules={{
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Only numbers allowed",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className=" text-brand-999 font-medium text-sm" required>
                      Percentage
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        {...field}
                        onChange={(e) => {
                          // Remove all non-numeric characters (including currency symbols and separators)
                          const numericValue = e.target.value.replace(/\D/g, "");
                          field.onChange(numericValue);
                        }}
                        onBlur={field.onBlur}
                        value={`${field.value ?? 0} %`}

                        // className="w-auto min-w-[388px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {paymentModel === "percentage_with_min" && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`${prefix}.model_params.percentage`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Percentage
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${field.value ?? 0} %`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${prefix}.model_params.min_amount`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Min. Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${prefix}.model_params.min_threshold_people`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Min. Students
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onBlur={field.onBlur}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {paymentModel === "fixed" && (
              <FormField
                control={control}
                name={`${prefix}.model_params.amount`}
                rules={{
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Only numbers allowed",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className=" text-brand-999 font-medium text-sm" required>
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        {...field}
                        onChange={(e) => {
                          // Remove all non-numeric characters (including currency symbols and separators)
                          const numericValue = e.target.value.replace(/\D/g, "");
                          field.onChange(numericValue);
                        }}
                        onBlur={field.onBlur}
                        value={`${formatCurrency(field.value ?? 0)}`}

                        // className="w-auto min-w-[388px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {paymentModel === "tiered" && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`${prefix}.model_params.base_amount`}
                  // name="regular.model_params.base_amount"
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Base Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  // name="regular.model_params.base_people"
                  name={`${prefix}.model_params.base_people`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Min Student
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onBlur={field.onBlur}
                          value={field.value ?? 0}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  // name="regular.model_params.additional_per_person"
                  name={`${prefix}.model_params.additional_per_person`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Additional per Stundent
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {paymentModel === "per_person_with_min" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  // name="regular.model_params.per_person_amount"
                  name={`${prefix}.model_params.per_person_amount`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Rate Per Person
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  // name="regular.model_params.min_amount"
                  name={`${prefix}.model_params.min_amount`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Min Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {paymentModel === "source_based" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  // name="regular.model_params.credit_rate"
                  name={`${prefix}.model_params.credit_rate`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Credit Rate
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  // name="regular.model_params.non_credit_rate"
                  name={`${prefix}.model_params.non_credit_rate`}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Non Credit Rate
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                          onChange={(e) => {
                            // Remove all non-numeric characters (including currency symbols and separators)
                            const numericValue = e.target.value.replace(/\D/g, "");
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          value={`${formatCurrency(field.value ?? 0)}`}

                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
