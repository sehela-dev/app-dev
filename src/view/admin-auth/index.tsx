"use client";

import type React from "react";

import { LogoComponent } from "@/components/asset/logo";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/general/password-input";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLoginAdmin } from "@/hooks/api/mutations";
import { useAuthAdmin } from "@/context/admin/admin-context";

const defaultValues = {
  email: "",
  password: "",
};

export default function AdminLoginPage() {
  const { mutateAsync } = useLoginAdmin();

  const { login } = useAuthAdmin();
  const methods = useForm({ defaultValues });

  const { control, handleSubmit } = methods;

  const handleLogin = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
      };
      const res = await mutateAsync(payload);
      if (res) {
        login({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          user: res.user,
          expires_at: res.expires_at,
          expires_in: res.expires_in,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <div className="flex flex-col items-center w-full space-y-12 font-serif h-screen justify-center">
      {/* Logo */}
      <div className="pt-12 flex justify-center">
        <LogoComponent className="w-[99px] h-[32px]" />
      </div>

      {/* Main Content */}

      <div className="w-full   mx-auto max-w-[361px]">
        <div className="bg-white mx-auto w-full px-6 rounded-md pt-10">
          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-brand-500 leading-tight">Welcome Back!</h2>
            <h3 className="text-3xl font-bold text-brand-500 leading-tight">Login</h3>
          </div>
          <FormProvider {...methods}>
            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-2 my-4">
              {/* Email Field */}
              <div className="space-y-3">
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
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Passwword
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="password@1234"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Field */}

              {/* Forgot Password */}
              <div className="text-right">
                <a href="#" className="text-sm font-medium text-brand-400 hover:text-teal-700 transition-colors">
                  Forgot your password?
                </a>
              </div>

              {/* Login Button */}
              <div className="flex w-full flex-col gap-2">
                <Button type="submit" className="w-full max-h-[42px] min-h-[42px] text-sm">
                  Login
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
