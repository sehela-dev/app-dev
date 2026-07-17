"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { PasswordInput } from "@/components/general/password-input";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTitle, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useAuthMember } from "@/context/member.ctx";
import { useUpdateProfile } from "@/hooks/api/mutations/customers";

import { createFormData, normalizePhoneNumber, previewURLHelper } from "@/lib/helper";
import { ACCEPTED_IMAGE_TYPES } from "@/resolver";
import { Camera, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type TSheetType = "name" | "password" | "avatar" | "phone" | "email" | null;

const passwordInputClassName =
  "w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]";

export const UpdateProfilePage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { profile, refetch, logout } = useAuthMember();
  const { mutateAsync } = useUpdateProfile();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sheetType, setSheetType] = useState<TSheetType>(null);
  const [open, setOpen] = useState(false);
  const [openReloginDialog, setOpenReloginDialog] = useState(false);

  const acceptValue = useMemo(() => String(ACCEPTED_IMAGE_TYPES), []);

  const values = useMemo(
    () => ({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    }),
    [profile?.full_name, profile?.phone],
  );
  const methods = useForm({ values });

  const handleCloseSheet = () => {
    setOpen(false);
    setSheetType(null);
    setPhotoFile(null);
    methods.reset({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleChoosePhoto = () => inputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPhotoFile(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoFile(null);
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
  };

  const avatarSrc = photoFile ? previewURLHelper(photoFile) : (profile?.photo_url as string) || "/assets/user-placeholder.png";

  const onSavePhoto = async () => {
    try {
      const payload = createFormData({ photo: photoFile });
      const res = await mutateAsync(payload);
      if (res) {
        await refetch?.();
        handleCloseSheet();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      let res;

      if (sheetType === "name") {
        res = await mutateAsync({ full_name: data.full_name });
      }

      if (sheetType === "phone") {
        res = await mutateAsync({ phone: normalizePhoneNumber(data.phone) });
      }

      if (sheetType === "password") {
        if (data.new_password !== data.confirm_password) {
          methods.setError("confirm_password", { message: "Passwords do not match" });
          return;
        }

        res = await mutateAsync({
          current_password: data.current_password,
          new_password: data.new_password,
        });

        if (res) {
          handleCloseSheet();
          setOpenReloginDialog(true);
          return;
        }
      }

      if (res) {
        refetch?.();
        handleCloseSheet();
      }
    } catch (error: any) {
      if (error?.response?.data?.error?.code === 'INVALID_PASSWORD') {
        methods.setError("current_password", { message: "Password Invalid!" });
      }

      console.log(error);
    }
  });

  const handleConfirmRelogin = () => {
    setOpenReloginDialog(false);
    logout();
    router.push("/auth/login");
  };

  const renderComponent = () => {
    switch (sheetType) {
      case "avatar":
        return {
          title: "Change Profile Picture",
          component: (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              {" "}
              <div className="relative min-h-[138px]  w-full">
                <Input ref={inputRef} type="file" hidden accept={acceptValue} onChange={handlePhotoChange} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[90px] h-[90px]">
                    <Image src={avatarSrc} alt="Profile Avatar" fill className="rounded-full object-cover border-4 border-white shadow-lg" priority />
                    <Button
                      type="button"
                      onClick={handleChoosePhoto}
                      size="icon"
                      className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-brand-500 border-2 border-white hover:bg-brand-600"
                      aria-label="Change profile photo"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="flex flex-col w-full gap-2">
                    <div className="w-full">
                      <Button className="w-full" onClick={onSavePhoto}>
                        Save
                      </Button>
                    </div>
                    <Button variant={"outline"} className="w-full" onClick={handleCloseSheet}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        };
      case "name":
        return {
          title: "Change Full Name",
          component: (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="relative w-full">
                <FormField
                  control={methods.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Full name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={profile?.full_name ?? ""}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]  appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="flex flex-col w-full gap-2">
                    <div className="w-full">
                      <Button className="w-full" onClick={onSubmit}>
                        Save
                      </Button>
                    </div>
                    <Button variant={"outline"} className="w-full" onClick={handleCloseSheet}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        };
      case "phone":
        return {
          title: "Change Phone Number",
          component: (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="relative w-full">
                <FormField
                  control={methods.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={profile?.phone ?? ""}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]  appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="flex flex-col w-full gap-2">
                    <div className="w-full">
                      <Button className="w-full" onClick={onSubmit}>
                        Save
                      </Button>
                    </div>
                    <Button variant={"outline"} className="w-full" onClick={handleCloseSheet}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        };
      case "password":
        return {
          title: "Change Password",
          component: (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="flex flex-col gap-4 w-full">
                <FormField
                  control={methods.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-brand-999 font-medium text-sm" required>
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput className={passwordInputClassName} placeholder="Current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-brand-999 font-medium text-sm" required>
                        New Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput className={passwordInputClassName} placeholder="New password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-brand-999 font-medium text-sm" required>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput className={passwordInputClassName} placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-400 hover:text-teal-700 transition-colors" target="_blank">
                    Forgot your password?
                  </Link>
                </div> */}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="flex flex-col w-full gap-2">
                    <div className="w-full">
                      <Button className="w-full" onClick={onSubmit}>
                        Save
                      </Button>
                    </div>
                    <Button variant={"outline"} className="w-full" onClick={handleCloseSheet}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        };

      default:
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen  font-serif text-brand-500">
      <div className="text-brand-500">
        <NavHeaderComponent title="Edit Profile" />
      </div>
      <div className="flex flex-col">
        <div className="relative min-h-[138px] bg-brand-100 w-full">
          <Input
            ref={inputRef}
            type="file"
            hidden
            accept={acceptValue}
            onChange={() => {
              setOpen(true);
              setSheetType("avatar");
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[90px] h-[90px]">
              <Image
                src={(profile?.photo_url as string) || "/assets/user-placeholder.png"}
                alt="Profile Avatar"
                fill
                className="rounded-full object-cover border-4 border-white shadow-lg"
                priority
                unoptimized
              />
              <Button
                type="button"
                onClick={() => {
                  setSheetType("avatar");
                  setOpen(true);
                }}
                size="icon"
                className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-brand-500 border-2 border-white hover:bg-brand-600"
                aria-label="Change profile photo"
              >
                <Camera className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <ProfileRow
          label="Your Name"
          value={(profile?.full_name as string) || "-"}
          onClick={() => {
            setSheetType("name");
            setOpen(true);
          }}
        />
        <Divider />
        <ProfileRow
          label="Phone Number"
          value={(profile?.phone as string) || "-"}
          onClick={() => {
            setOpen(true);
            setSheetType("phone");
          }}
        />
        <Divider />
        <ProfileRow
          label="Password"
          value="******"
          onClick={() => {
            setOpen(true);
            setSheetType("password");
          }}
        />
        <Divider />
        <ProfileRow label="Email" value={(profile?.email as string) || "-"} onClick={() => setSheetType("email")} hide />
      </div>
      {/* sheet ganti profile */}

      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleCloseSheet()}>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <SheetContent side="bottom" className="min-h-[30vh] bg-brand-25 font-serif">
              <SheetHeader>
                <SheetTitle className="text-brand-500">{renderComponent()?.title}</SheetTitle>
              </SheetHeader>
              {renderComponent()?.component}
            </SheetContent>
          </form>
        </FormProvider>
      </Sheet>

      <BaseDialogConfirmation
        open={openReloginDialog}
        image="warning-1"
        title="Password updated successfully"
        subtitle="For your security, please sign in again. Your current session will be replaced after you log in."
        confirmText="Login again"
        hideCancel
        onCancel={() => { }}
        onConfirm={handleConfirmRelogin}
      />
    </div>
  );
};

const ProfileRow = ({ label, value, onClick, hide = false }: { label: string; value: string; onClick: () => void; hide?: boolean }) => {
  return (
    <button type="button" className="w-full grid grid-cols-12 gap-3 px-4 py-4 text-left hover:bg-brand-200/30 transition-colors" onClick={onClick}>
      <div className="col-span-11 flex flex-col gap-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-brand-400">{value}</p>
      </div>
      {!hide && (
        <div className="col-span-1 flex items-center justify-end">
          <ChevronRight strokeWidth={2} />
        </div>
      )}
    </button>
  );
};
