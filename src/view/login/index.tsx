"use client";

import type React from "react";

import { useState } from "react";
import { LogoComponent } from "@/components/asset/logo";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/general/password-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

export default function LoginPageView() {
  const methods = useForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", { email, password });
  };

  return (
    <div className="flex flex-col items-center w-full space-y-12 font-serif">
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
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors h-[42px]"
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
                  control={methods.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Passwword
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors h-[42px]"
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
                <div className="flex items-center gap-4 w-full justify-center">
                  <span className="text-brand-500 font-medium text-center text-sm">Or login with</span>
                </div>
                <Button
                  type="button"
                  variant={"outline"}
                  className="text-sm w-full py-4 border-2 border-gray-200 rounded-lg flex items-center justify-center gap-3 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm font-medium text-teal-700">Login with Google</span>
                </Button>
              </div>
            </form>
          </FormProvider>

          {/* Divider */}

          {/* Google Login */}

          {/* Sign Up Link */}
          <div className="text-center space-y-4 pb-12">
            <p className="text-sm text-brand-500">
              Don’t have an account?
              <a href="#" className="ml-1 font-semibold text-brand-500 hover:text-brand-600 underline transition-colors">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
