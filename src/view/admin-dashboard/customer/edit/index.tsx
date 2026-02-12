"use client";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEditCustomer } from "@/hooks/api/mutations/admin";
import { useGetCustomerDetail } from "@/hooks/api/queries/admin/customers";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  email: "",
  // password: "",
  full_name: "",
  phone: "",
  // instagram_username: "",
  // photo_url: "",
  // tnc_agreed: false,
  // photo_consent: false,
};

export const EditMemberPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetCustomerDetail(id as string);
  const { mutateAsync } = useEditCustomer();
  const [open, setOpen] = useState({
    SUCCESS: false,
    CANCEL: false,
  });

  const values = useMemo(() => {
    if (!data?.data) return defaultValues;
    return {
      email: data?.data?.profile?.email,
      full_name: data?.data?.profile?.full_name,
      phone: data?.data?.profile?.phone,
    };
  }, [data?.data]);

  const methods = useForm({ defaultValues, values });

  const { handleSubmit, control } = methods;

  const handleOpenModal = (type: "SUCCESS" | "CANCEL") => {
    setOpen((prev) => ({ ...prev, [type]: !open[type] }));
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        email: data?.email,
        full_name: data?.full_name,
        phone: data?.phone,
      };
      const res = await mutateAsync({ data: payload, id: id as string });
      if (res) {
        console.log(res);
        handleOpenModal("SUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold">Edit Member</h3>
        <p className="text-sm text-gray-500">Set up a new member account and keep their information organized for easy tracking.</p>
      </div>

      <Card className="p-8 border-gray-200">
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="mb-8 w-full grid grid-cols-2 gap-4 ">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" text-brand-999 font-medium text-sm">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" text-brand-999 font-medium text-sm">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        {...field}
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
                  <FormItem>
                    <FormLabel className=" text-brand-999 font-medium text-sm">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=" text-brand-999 font-medium text-sm">Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" 
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                           {...field} />
                        </FormControl>
                        <FormDescription>Minimum 8 characters required</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

              {/* Full Name */}

              {/* Phone */}

              {/* Instagram Username */}
              {/* <FormField
                control={control}
                name="instagram_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" text-brand-999 font-medium text-sm">Instagram Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* <div className="col-span-2">
                <FormField
                  control={control}
                  name="photo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className=" text-brand-999 font-medium text-sm">Photo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/photo.jpg"
                          type="file"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}
            </div>

            {/* Consents Section */}
            {/* <div className="border-t border-gray-200 pt-8"> */}
            {/* <h2 className="text-lg font-semibold text-foreground mb-6">Agreements</h2> */}
            {/* <div className="space-y-4">

                <FormField
                  control={control}
                  name="tnc_agreed"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">I agree to the Terms and Conditions</FormLabel>
                        <FormDescription>Please read and accept our terms before continuing</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

            {/* <FormField
                  control={control}
                  name="photo_consent"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">I consent to share my photo</FormLabel>
                        <FormDescription>Your photo may be used in member communications</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
            {/* </div> */}
            {/* </div> */}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 w-full justify-end">
              <Button type="submit" disabled={false} className="bg-brand-600 hover:bg-brand-700 text-white">
                {false ? "Creating Member..." : "Edit Member"}
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
      {open.SUCCESS && (
        <BaseDialogConfirmation
          image="success-edit"
          onCancel={() => router.push("/admin/instructor")}
          open={open.SUCCESS}
          title="Member Updated Successfully"
          subtitle="The member has been successfully updated."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("SUCCESS");
            router.push(`/admin/member/${id}`);
          }}
          hideCancel
          cancelText="Member List"
          confirmText="Ok"
        />
      )}
      {open.CANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("CANCEL")}
          open={open.CANCEL}
          title="Member data is not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push(`/admin/member/${id}`)}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </div>
  );
};
