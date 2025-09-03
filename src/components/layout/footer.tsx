import { Instagram, Mail, Phone } from "lucide-react";
import { LogoComponent } from "../asset/logo";
import Image from "next/image";

export const MainFooterComponent = () => {
  return (
    <div className="bg-brand-500 flex w-full text-gray-50 font-serif">
      <div className="px-4 py-10.5 flex flex-col gap-9.5 w-full">
        <div className="flex flex-col gap-6">
          <p className="text-xl font-bold">Contacts</p>
          <div className="flex flex-col gap-4 font-normal">
            <p className="flex items-center gap-2.5 text-sm">
              <Phone />
              +628111469688
            </p>
            <p className="flex items-center gap-2.5 text-sm">
              <Mail />
              sehelaspace@gmail.com
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-xl font-bold">Socials</p>
          <div className="flex flex-col gap-4 font-normal">
            <p className="flex items-center gap-2.5 text-sm">
              <Instagram />
              @sehelaspace
            </p>
            <p className="flex items-center gap-2.5 text-sm">
              <Instagram />
              @denisepayneyoga
            </p>
          </div>
        </div>
        <div className="flex  justify-center items-center mx-auto">
          <div className="flex items-center w-full justify-center mt-4 gap-2.5">
            <LogoComponent className="w-[99px] h-[32px]" src="sehela-light.png" />
            <div>
              <Image src={"/assets/one-song.png"} alt="one-song" width={48} height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
