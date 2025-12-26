"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import {
  SessionBasicInfoFormComponent,
  SessionDateTimeFormComponent,
  SessionLocationFormComponent,
  SessionPricingFormComponent,
} from "@/components/page/session/form";
import { Button } from "@/components/ui/button";
import { useCreateNewSession } from "@/hooks/api/mutations/admin";
import { defaultDate } from "@/lib/helper";
import { ICreateSessionPaylaod } from "@/types/class-sessions.interface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  //BASIC INFORMATION
  session_name: "",
  class: {
    value: "",
    label: "",
  },
  capacity: "",
  instructor: {
    value: "",
    label: "",
  },
  description: "",

  //DATE AND TIME
  start_date: defaultDate().formattedToday,
  time_start: "10:00",
  time_end: "13:00",

  //LOCATION
  place: "offline",
  room: {
    value: "",
    label: "",
  },
  location: "",
  location_address: "",
  location_maps_url: "",
  meeting_link: "",

  //PRICING
  price_idr: "0",
  price_credit_amount: "1",
  is_recurring: "no",
  recurring_type: "",
  recurring_count: "0",

  //OTHER
  type: "regular",
  level: "advanced",
};

export const CreateSessionPageView = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;
  const { mutateAsync } = useCreateNewSession();

  const [open, setOpen] = useState({
    ONCANCEL: false,
    ONSUCCESS: false,
  });

  // useEffect(() => {
  //   const handler = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = "";
  //     // handleOpenModal("ONCANCEL");
  //   };

  //   window.addEventListener("beforeunload", handler);
  //   return () => window.removeEventListener("beforeunload", handler);
  // }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: ICreateSessionPaylaod = {
        session_description: data?.description,
        session_name: data?.session_name,

        class_id: data?.class.value as string,
        capacity: parseInt(data?.capacity),
        instructor_id: data?.instructor?.value,
        level: data?.level as string,
        type: data?.type as string,
        place: data?.place as string,
        ...(data?.is_recurring === "yes"
          ? {
              recurring: {
                type: data?.recurring_type,
                count: parseInt(data?.recurring_count),
              },
            }
          : null),
        ...(data?.place === "offline"
          ? {
              location: data?.location as string,
              location_maps_url: data?.location_maps_url as string,
              room_id: data?.room.value as string,
              location_address: data?.location_address,
            }
          : {
              meeting_link: data?.meeting_link as string,
            }),
        price_idr: parseInt(data?.price_idr),
        price_credit_amount: parseInt(data?.price_credit_amount),
        start_date: data?.start_date as string,
        time_start: data?.time_start as string,
        time_end: data?.time_end as string,
      };
      // console.log(payload, "payload");
      // return;
      const res = await mutateAsync(payload);
      if (res) {
        handleOpenModal("ONSUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  const handleOpenModal = (type: "ONCANCEL" | "ONSUCCESS") => {
    setOpen((prev) => ({
      ...prev,
      [type]: !open[type],
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-semibold">Create Session</h3>
        <p className="text-gray-500">Fill in the details to create a new session</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <SessionBasicInfoFormComponent />
            <div className="grid grid-cols-2 gap-2">
              <SessionDateTimeFormComponent />
              <SessionLocationFormComponent />
            </div>
            <SessionPricingFormComponent />
          </div>
          <div className="flex flex-row w-full items-center justify-end gap-4 mt-4">
            <div>
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => {
                  handleOpenModal("ONCANCEL");
                }}
              >
                Cancel
              </Button>
            </div>
            <div>
              <Button type="submit">Create Session</Button>
            </div>
          </div>
        </form>
      </FormProvider>

      {open.ONCANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("ONCANCEL")}
          open={open.ONCANCEL}
          title="Session Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/session")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}

      {open.ONSUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/session")}
          open={open.ONSUCCESS}
          title="Session Created Successfully"
          subtitle="Your new session has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("ONSUCCESS");
          }}
          cancelText="Session List"
          confirmText="Create More"
        />
      )}
    </div>
  );
};
