"use client";

import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTitle, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useAuthMember } from "@/context/member.ctx";
import { useUpdateProfile } from "@/hooks/api/mutations/customers";

import { createFormData, previewURLHelper } from "@/lib/helper";
import { ACCEPTED_IMAGE_TYPES } from "@/resolver";
import { Camera, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type TSheetType = "name" | "password" | "avatar" | "phone" | "email";

export const UpdateProfilePage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile, refetch } = useAuthMember();
  const { mutateAsync } = useUpdateProfile();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [openSheetPhoto, setOpenSheetPhoto] = useState(false);
  const [sheetType, setSheetType] = useState<TSheetType>("name");

  const [open, setOpen] = useState(false);

  const acceptValue = useMemo(() => String(ACCEPTED_IMAGE_TYPES), []);

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
      const d = {
        photo: photoFile,
      };
      const payload = createFormData(d);
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res);
        refetch?.();
        setPhotoFile(null);
        setOpenSheetPhoto(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderComponent = () => {
    switch (sheetType) {
      case "name":
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
                    <Button
                      variant={"outline"}
                      className="w-full"
                      onClick={() => {
                        setOpenSheetPhoto(false);
                        setPhotoFile(null);
                      }}
                    >
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
          }}
        />
        <Divider />
        <ProfileRow label="Phone Number" value={(profile?.phone as string) || "-"} onClick={() => setSheetType("phone")} />
        <Divider />
        <ProfileRow label="Password" value="******" onClick={() => setSheetType("password")} />
        <Divider />
        <ProfileRow label="Email" value={(profile?.email as string) || "-"} onClick={() => setSheetType("email")} />
      </div>
      {/* sheet ganti profile */}
      <Sheet
        open={open}
        onOpenChange={() => {
          setOpen(false);
        }}
      >
        <SheetContent side="bottom" className="min-h-[30vh] bg-brand-25 font-serif">
          <SheetHeader>
            <SheetTitle className="text-brand-500">{renderComponent()?.title}</SheetTitle>
          </SheetHeader>
          {renderComponent()?.component}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const ProfileRow = ({ label, value, onClick }: { label: string; value: string; onClick: () => void }) => {
  return (
    <button type="button" className="w-full grid grid-cols-12 gap-3 px-4 py-4 text-left hover:bg-brand-200/30 transition-colors" onClick={onClick}>
      <div className="col-span-11 flex flex-col gap-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-brand-400">{value}</p>
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <ChevronRight strokeWidth={2} />
      </div>
    </button>
  );
};
