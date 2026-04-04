"use client";

import { LogoComponent } from "@/components/asset/logo";
import { PasswordInput } from "@/components/general/password-input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useResetPassword } from "@/hooks/api/mutations/customers";

import { ResetPasswordFormValues, resetPasswordSchema } from "@/resolver";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  password: "",
  confirm_password: "",
};
const resolver = zodResolver(resetPasswordSchema);

export const ResetPasswordPageView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const methods = useForm<ResetPasswordFormValues>({ defaultValues, resolver });
  const { mutateAsync } = useResetPassword();
  const { control, handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        email: email,
        token: token,
        new_password: data?.confirm_password,
      };
      const res = await mutateAsync(payload);
      if (res) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.log(error);
    }
  });
  return (
    <div className="flex flex-col items-center w-full space-y-12 font-serif">
      {/* Logo */}
      <div className="pt-12 flex justify-center">
        <LogoComponent className="w-[99px] h-[32px]" />
      </div>

      {/* Main Content */}

      <div className="w-full   mx-auto max-w-[361px]">
        <div className="bg-white mx-auto w-full px-6 rounded-md py-10">
          {/* Heading */}
          <div className="">
            <h2 className="text-2xl font-bold text-brand-500 leading-tight mb-2">Reset Password</h2>
            <p className="text-sm font-normal text-brand-500">Set a new password to get back into your account.</p>
          </div>
          <div className="my-4">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="flex flex-col space-y-4">
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex w-full mt-4">
                  <Button type="submit" className="w-full">
                    Reset Password
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
