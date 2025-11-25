"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<typeof LabelPrimitive.Root> {
  required?: boolean;
}

function Label({ className, ...props }: Props) {
  return (
    <div className="flex flex-row gap-1">
      <LabelPrimitive.Root
        data-slot="label"
        className={cn(
          "flex items-center gap-2 text-sm leading-none font-medium text-neutral-400 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {props.required && <span className="m-0 p-0 text-sm text-red-500">*</span>}
    </div>
  );
}

export { Label };
