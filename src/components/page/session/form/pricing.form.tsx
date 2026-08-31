"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/helper";
import { FormProvider, useFormContext } from "react-hook-form";
import { useEffect, useMemo } from "react";

export const SessionPricingFormComponent = ({ disableCreditOnly = false }: { disableCreditOnly?: boolean } = {}) => {
  const methods = useFormContext();
  const { control, watch, setValue } = methods;
  const isCreditOnly = watch("is_credit_only");
  const photoFile: File | null = watch("photo");
  const photoUrl: string = watch("photo_url");

  useEffect(() => {
    if (!isCreditOnly) {
      const v = watch("price_idr");
      if (!v || v === "0" || v === 0) setValue("price_idr", "150000", { shouldDirty: true });
    }
  }, [isCreditOnly, setValue, watch]);

  const filePreview = useMemo(() => {
    if (photoFile instanceof File) return URL.createObjectURL(photoFile);
    return null;
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const previewSrc = filePreview || photoUrl || null;

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="font-semibold">Pricing</CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-brand-999">Credit Only</p>
                <p className="text-xs text-gray-500">
                  {disableCreditOnly ? "Cannot be changed after creation" : "When on, session only accepts credits (cash rejected)"}
                </p>
              </div>
              <FormField
                control={control}
                name="is_credit_only"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        disabled={disableCreditOnly}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name="photo"
              render={({ field: { value: _v, onChange, ...rest } }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-brand-999 font-medium text-sm">Session Photo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="w-full border-2 border-gray-200 rounded-lg text-gray-999 h-[42px] file:mr-3 file:rounded file:border-0 file:bg-brand-500 file:text-white file:px-3 file:py-1 file:text-sm"
                      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                      {...rest}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">Max 5 MB — uploaded as webp 1200×1200. File takes precedence over URL.</p>
                  <FormMessage />
                  {previewSrc ? (
                    <div className="flex items-center gap-2 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewSrc} alt="preview" className="h-24 w-24 rounded object-cover border" />
                      <button
                        type="button"
                        className="text-xs underline text-gray-500"
                        onClick={() => {
                          onChange(null);
                          setValue("photo_url", "");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="photo_url"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-brand-999 font-medium text-sm">Photo URL (fallback)</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px] disabled:opacity-50"
                      placeholder="https://.../photo.webp"
                      {...field}
                      value={field.value ?? ""}
                      disabled={!!photoFile}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">Used only when no file selected. Leave empty for no photo.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
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
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px] disabled:opacity-50"
                      placeholder="Rp"
                      {...field}
                      disabled={!!isCreditOnly}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      value={field.value ? formatCurrency(field.value) : ""}
                    />
                  </FormControl>
                  {isCreditOnly && <p className="text-xs text-gray-500">Disabled for credit-only sessions (IDR = 0)</p>}
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
