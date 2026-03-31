"use client";

import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTitle, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useAuthMember } from "@/context/member.ctx";
import { useGetProfile } from "@/hooks/api/queries/customer/profile/use-get-profile";
import { previewURLHelper } from "@/lib/helper";
import { ACCEPTED_IMAGE_TYPES } from "@/resolver";
import { Camera, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export const UpdateProfilePage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthMember();
  console.log(user);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { isAuthReady } = useAuthMember();
  const { data: profileRes } = useGetProfile(isAuthReady);
  const profile = profileRes?.data;

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

  return (
    <div className="flex flex-col min-h-screen  font-serif text-brand-500">
      <div className="text-brand-500">
        <NavHeaderComponent title="Edit Profile" />
      </div>
      <div className="flex flex-col">
        <div className="relative min-h-[138px] bg-brand-100 w-full">
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
      </div>

      <div className="pt-3">
        <ProfileRow label="Your Name" value={(profile?.full_name as string) || "-"} />
        <Divider />
        <ProfileRow label="Phone Number" value={(profile?.phone as string) || "-"} />
        <Divider />
        <ProfileRow label="Password" value="******" />
        <Divider />
        <ProfileRow label="Email" value={(profile?.email as string) || "-"} />
      </div>
      <Sheet open={true}>
        <SheetContent side="bottom" className="min-h-[30vh] bg-gray-50 font-serif">
          <SheetHeader hidden>
            <SheetTitle></SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const ProfileRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <button
      type="button"
      className="w-full grid grid-cols-12 gap-3 px-4 py-4 text-left hover:bg-brand-200/30 transition-colors"
      onClick={() => {
        // navigation / edit flow intentionally left for next step
      }}
    >
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
