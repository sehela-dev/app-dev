"use client";

import type React from "react";

import { LogoComponent } from "@/components/asset/logo";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/general/password-input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES, AuthSignUpFormValues, authSignUpSchema } from "@/resolver";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { previewURLHelper } from "@/lib/helper";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateProfile } from "@/hooks/api/mutations/customers";
import { Divider } from "@/components/ui/divider";
import { useRouter } from "next/navigation";
import { useGetProfile } from "@/hooks/api/queries/customer/profile";
import { useJwtToken } from "@/hooks";
import { IAuthSignUpPaylaod } from "@/types/customer-app/auth-customer.interface";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const defaultValues = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
  instagram_username: "",
  gender: "",
  date_of_birth: "",
  photo: null,
  photo_consent: false,
  tnc_agreed: false,

  confirm_password: "",
  medical_notes: "",
};
const resolver = zodResolver(authSignUpSchema);

export const CompleteProfilePageView = () => {
  const router = useRouter();
  const { data: profileUser, isLoading, refetch } = useGetProfile();

  const values = useMemo(() => {
    if (!profileUser?.data) return defaultValues;
    return {
      email: profileUser?.data?.email,
      full_name: profileUser?.data?.full_name,
      password: "",
      phone: profileUser?.data?.phone ?? "",
      instagram_username: profileUser?.data?.instagram_username ?? "",
      gender: profileUser?.data?.gender ?? "",
      date_of_birth: profileUser?.data?.date_of_birth,
      photo: null,
      photo_consent: false,
      tnc_agreed: false,
      confirm_password: "",
    };
  }, [profileUser]);

  const methods = useForm<AuthSignUpFormValues>({ defaultValues, resolver, mode: "all", values });

  const { control, handleSubmit } = methods;
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useUpdateProfile();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: IAuthSignUpPaylaod = {
        email: data?.email,
        full_name: data?.full_name,
        password: data?.password,
        date_of_birth: data?.date_of_birth,
        gender: data?.gender,
        ...(data?.instagram_username ? { instagram_username: data?.instagram_username } : null),
        ...(data?.photo ? { photo: data?.photo } : null),
        photo_consent: data?.photo_consent as boolean,
        tnc_agreed: data?.tnc_agreed,
      };

      const res = await mutateAsync(payload);
      if (res) {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  });

  // if (isLoading)
  //   return (
  //     <div className="flex items-center justify-center py-6">
  //       <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  //     </div>
  //   );

  return (
    <div className="flex flex-col items-center w-full space-y-12 font-serif">
      {/* Logo */}
      <div className="pt-12 flex justify-center   items-center w-full mx-auto max-w-[361px]">
        <LogoComponent className="w-[99px] h-[32px]" />
      </div>

      {/* Main Content */}

      <div className="w-full   mx-auto max-w-[361px]">
        <div className="bg-white mx-auto w-full px-6 rounded-md pt-10">
          {/* Heading */}
          <div className="">
            <h3 className="text-3xl font-bold text-brand-500 leading-tight">Complete your Profile</h3>
            <h3 className="text-sm font-normal text-brand-400 leading-tight">Enter your information to complete your profile.</h3>
          </div>
          <FormProvider {...methods}>
            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-2 my-4">
              {/* Email Field */}
              <div className="space-y-3">
                <FormField
                  control={control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here..."
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
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here..."
                          type="date"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Gender
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue="male"
                          value={field.value}
                          className="flex flex-row gap-3 items-center"
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          {["male", "female"].map((item) => (
                            <div className="flex items-center gap-3" key={item}>
                              <RadioGroupItem value={item} id="gender" onClick={() => item} />
                              <Label htmlFor="gender" className="text-brand-500 capitalize">
                                {item}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="mail@example.com"
                          readOnly
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm" required>
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="0812xxxx"
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
                  name="instagram_username"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm">Username Instagram</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here..."
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
                  name="photo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm">Photo Profile</FormLabel>
                      <FormControl>
                        <div className="flex flex-row items-center gap-4">
                          <div className="object-cover">
                            <Image
                              src={previewURLHelper(field.value)}
                              alt="placeholder"
                              width={75}
                              height={75}
                              className="min-w-[75px] min-h-[75px] rounded-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Input
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                              placeholder="Type here..."
                              ref={inputRef}
                              type="file"
                              hidden
                              accept={String(ACCEPTED_IMAGE_TYPES)}
                              onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                              // className="w-auto min-w-[388px]"
                            />
                            <div className="flex flex-col gap-2">
                              <Button className="text-sm" size={"sm"} type="button" onClick={() => inputRef.current?.click()}>
                                Choose File
                              </Button>
                              <FormDescription className="text-gray-500 !text-xs">Max File 2 Mb</FormDescription>
                            </div>
                          </div>
                        </div>
                        {/* <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here..."
                          {...field}
                          // className="w-auto min-w-[388px]"
                        /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="medical_notes"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-serif text-brand-500 text-sm">Medical Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          {...field}
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
                <Divider className="my-6" color="var(--color-gray-400)" />
                <FormField
                  control={control}
                  name="photo_consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start">
                      <FormControl>
                        <Checkbox id="photo_consent" checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                      </FormControl>

                      <FormLabel htmlFor="photo_consent" className="cursor-pointer text-brand-500 font-normal text-sm">
                        I agree to allow Sehela Space to use my photo for social media purposes.
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="tnc_agreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start">
                      <FormControl>
                        <Checkbox id="tnc" checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                      </FormControl>

                      <FormLabel htmlFor="tnc" className="cursor-pointer text-brand-500 font-normal text-sm">
                        <p className="text-sm">
                          I confirm that I have read and accept the{" "}
                          <a className="font-semibold text-sm underline" href="/tnc">
                            Term and Conditions{" "}
                          </a>{" "}
                          and the{" "}
                          <a className="font-semibold text-sm underline" href="/policy">
                            Privacy Policy
                          </a>{" "}
                        </p>
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Field */}

              {/* Forgot Password */}

              {/* Login Button */}
              <div className="flex w-full flex-col gap-2">
                <Button type="submit" className="w-full max-h-[42px] min-h-[42px] text-sm">
                  Complete your profile
                </Button>
              </div>
              <div className="text-center space-y-4 mt-12 pb-2">
                <p className="text-gray-500 text-sm">
                  Already have an account?{" "}
                  <a className="text-brand-500 font-bold underline" href="/auth/login">
                    Log in here
                  </a>
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
