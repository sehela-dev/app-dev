"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/helper";
import { FormProvider, useFormContext } from "react-hook-form";

export const SessionPricingFormComponent = () => {
  const methods = useFormContext();
  const { control } = methods;

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="font-semibold">Pricing</CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
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
              name="price_credit_amount"
              rules={{
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Only numbers allowed",
                },
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Credit Price
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
                      value={field.value ?? ""}
                      // className="w-auto min-w-[388px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <div className="flex flex-col gap-2 pt-2">
                  <FormField
                    control={control}
                    name="credit_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>

                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                            placeholder="Rp"
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
                    name="credit_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          Credit Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                            placeholder="Rp"
                            {...field}
                            // className="w-auto min-w-[388px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}
        </CardContent>
      </Card>
    </FormProvider>
  );
};
