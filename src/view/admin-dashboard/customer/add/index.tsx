"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateCustomer } from "@/hooks/api/mutations/admin";
import { DEFAULT_PASSWORD } from "@/lib/config";
import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  full_name: "",
  email: "",
  phone: "",
  // password: DEFAULT_PASSWORD,
};

export const CreateMemberPage = () => {
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;

  const { mutateAsync } = useCreateCustomer();

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      const payload = {
        ...data,
      };
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res);
        methods.reset();
      }
    } catch (error) {
      console.log(error);
    }
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Create Member</h3>
        <p className="text-sm text-gray-500">Set up a new member account and keep their information organized for easy tracking.</p>
      </div>

      <Card>
        <CardHeader className="font-semibold ">Basic Information</CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="w-full">
              <div className="grid grid-cols-12 gap-4 ">
                <div className="col-span-4">
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
                </div>
                <div className="col-span-4">
                  <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className=" text-brand-999 font-medium text-sm" required>
                          WhatsApp
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-brand-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
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
                <div className="col-span-4">
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
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-brand-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
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
                </div>
              </div>
              <div className="flex justify-end pt-4 gap-2">
                <div>
                  <Button type="button" variant={"secondary"} onClick={() => methods.reset()}>
                    Cancel
                  </Button>
                </div>
                <div>
                  <Button type="submit">Create Member</Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
