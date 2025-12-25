"use client";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
// import { useCreateNewGuest } from "@/hooks/api/mutations/admin";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
const customerSectionTab = [
  {
    value: "new",
    name: "New Customer",
  },
  {
    value: "search",
    name: "Find Member",
  },
];

const defaultValues = {
  name: "",
  phone: "",
  email: "",
};
export const OrderCustomerSectionComponent = () => {
  const { addCustomer } = useAdminManualTransaction();
  // const { mutateAsync } = useCreateNewGuest();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const [tabCustomer, setTabCustomer] = useState("new");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        email: data.email,
        name: data.name,
        phone: data.phone,
        // role: "guest",
      };
      // const res = await mutateAsync(payload);
      // if (res) {
      //   console.log(res);
      // }
      addCustomer(payload);
      methods.reset();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <Card className="p-6  border-brand-100 w-full">
      <CardHeader className="p-0">
        <h3 className="text-3xl font-semibold">Customer Information</h3>
        <p className="text-sm text-gray-500">Enter Customer Information</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-1">
          <div className="max-w-[25%]">
            <GeneralTabComponent selecetedTab={tabCustomer} setTab={setTabCustomer} tabs={customerSectionTab} />
          </div>
          <div className="flex w-full pt-4">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="w-full">
                <div className="grid grid-cols-12 gap-4 ">
                  <div className="col-span-4">
                    <FormField
                      control={control}
                      name="name"
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
                          <FormLabel className=" text-brand-999 font-medium text-sm">Email (optional)</FormLabel>
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
                      Clear
                    </Button>
                  </div>
                  <div>
                    <Button type="submit">Create Customer/Guest</Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
