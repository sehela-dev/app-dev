"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ILogoProps {
  className?: string;
  src?: string;
}

export const LogoComponent = ({ className, src = "logo.png" }: ILogoProps) => {
  return (
    <div className={cn(className, "relative")}>
      <Image src={`/assets/${src}`} alt="logo-sehela" width={99} height={32} loading="lazy" />
    </div>
  );
};
