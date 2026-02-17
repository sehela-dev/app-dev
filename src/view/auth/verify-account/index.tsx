"use client";

import { LogoComponent } from "@/components/asset/logo";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCountdown } from "@/hooks";
import { useCustomerAuthVerifyAccount, useCustomerAuthResendVerifyAccount } from "@/hooks/api/mutations/customers";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

export const VerifyAccountPageView = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const currDate = (searchParams.get("accessed_at") as string) ?? "";

  const email = (searchParams.get("email") as string) ?? "";
  const { mutateAsync } = useCustomerAuthVerifyAccount();
  const { mutateAsync: resend } = useCustomerAuthResendVerifyAccount();

  const timer = useCountdown({ startTime: parseInt(currDate), duration: 90 });

  const methods = useForm();
  const { control, handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        email: email,
        code: data?.code,
      };
      const res = await mutateAsync(payload);
      if (res) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.log(error);
    }
  });

  const onResend = async () => {
    try {
      const payload = {
        email: email,
      };
      const res = await resend(payload);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  };
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

      {/* Main Content */}

      <div className="w-full mx-auto max-w-[361px]">
        <div className="bg-white mx-auto w-full px-6 rounded-md pt-10">
          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-bold text-brand-500 leading-tight">Verify your account</h3>
            <p className="text-sm font-normal text-brand-500">
              Enter the 6-digit code we sent to <span className="font-bold">{email}</span>
            </p>
          </div>
          <FormProvider {...methods}>
            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-2 my-4">
              <FormField
                control={control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP maxLength={6} onChange={field.onChange}>
                        <InputOTPGroup className="flex w-full items-center justify-center">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex w-full flex-col gap-2 pt-4">
                <Button type="submit" className="w-full max-h-[42px] min-h-[42px] text-sm">
                  Verify Account
                </Button>
              </div>
              <div className="text-center space-y-4 py-2">
                <p className="text-gray-500 text-sm">
                  Didn’t got the code?{" "}
                  {timer?.isExpired ? (
                    <a className="text-brand-500 font-bold cursor-pointer" onClick={onResend}>
                      Resend
                    </a>
                  ) : (
                    <span className="text-brand-300 font-bold">Resend in {timer.formattedTime}</span>
                  )}
                </p>
              </div>
            </form>
          </FormProvider>

          {/* Divider */}

          {/* Google Login */}

          {/* Sign Up Link */}
        </div>
      </div>
    </div>
  );
};
