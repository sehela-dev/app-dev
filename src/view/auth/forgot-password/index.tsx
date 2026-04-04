"use client";
import { LogoComponent } from "@/components/asset/logo";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthForgotPassword } from "@/hooks/api/mutations/customers";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  email: "",
};

export const ForgotPasswordPageView = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;

  const { mutateAsync } = useAuthForgotPassword();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const paylaod = {
        email: data?.email,
      };
      const res = await mutateAsync(paylaod);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <div className="flex flex-col items-center w-full space-y-12 font-serif">
      {/* Logo */}
      <div className="pt-12 flex justify-between   items-center w-full mx-auto max-w-[361px]">
        <div>
          <ArrowLeft color="var(--color-brand-500)" onClick={() => router.push("/auth/sign-up")} />
        </div>
        <LogoComponent className="w-[99px] h-[32px]" />
        <div></div>
      </div>
      <div className="w-full mx-auto max-w-[361px]">
        <div className="bg-white mx-auto w-full px-6 rounded-md py-10">
          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-bold text-brand-500 leading-tight">Forgot Password</h3>
            <p className="text-sm font-normal text-brand-500">Enter your email and we will guide you to reset your password.</p>
          </div>
          <div className="mt-4">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit}>
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="example@mail.com"
                          {...field}
                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex w-full mt-4">
                  <Button type="submit" className="w-full">
                    Send
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
