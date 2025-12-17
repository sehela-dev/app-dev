"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClassSession } from "@/hooks/api/mutations/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  class_name: "",
  class_description: "",
  allow_credit: true,
};
export const AddClassPageView = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const { mutateAsync } = useCreateClassSession();
  const [open, setOpen] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        is_active: true,
      };
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res.data);
        methods.reset();
        // router.push("/admin/class");
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
    </div>
  );
};
