"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import {
  SessionBasicInfoFormComponent,
  SessionDateTimeFormComponent,
  SessionLocationFormComponent,
  SessionPricingFormComponent,
} from "@/components/page/session/form";
import { Button } from "@/components/ui/button";
import { useEditSession } from "@/hooks/api/mutations/admin";
import { useGetSessionDetail } from "@/hooks/api/queries/admin/class-session";

import { ICreateSessionPaylaod } from "@/types/class-sessions.interface";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import { FormProvider, useForm } from "react-hook-form";

const defaultValues = {
  //BASIC INFORMATION
  session_id: "",
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
  start_date: "",
  time_start: "",
  time_end: "",

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

  //OTHER
  type: "regular",
  level: "advanced",
};

export const EditSessionPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading, isFetched } = useGetSessionDetail(id as string);
  const [open, setOpen] = useState({
    ONCANCEL: false,
    ONSUCCESS: false,
  });

  // const [values, setValues] = useState({});

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      // handleOpenModal("ONCANCEL");
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleOpenModal = (type: "ONCANCEL" | "ONSUCCESS") => {
    setOpen((prev) => ({
      ...prev,
      [type]: !open[type],
    }));
  };
  const { mutateAsync } = useEditSession();

  const values = useMemo(() => {
    if (!data?.data) return defaultValues;
    return {
      session_id: data?.data?.session_id,
      session_name: data?.data?.session_name,
      class: {
        value: data?.data?.class.id,
        label: data?.data?.class?.class_name,
      },
      capacity: data?.data?.capacity,
      instructor: {
        value: data?.data?.instructor_id,
        label: data?.data?.instructor_name,
      },
      description: data?.data?.session_description,

      //DATE AND TIME
      start_date: data?.data?.start_date,
      time_start: data?.data?.time_start,
      time_end: data?.data?.time_end,

      //LOCATION
      place: data?.data?.place,
      room: {
        value: data?.data?.room_id,
        label: data?.data?.location,
      },
      location_address: data?.data?.location_address,
      location_maps_url: data?.data?.location_maps_url,
      meeting_link: data?.data?.meeting_link,

      //PRICING
      price_idr: String(data?.data?.price_idr),
      price_credit_amount: String(data?.data?.price_credit_amount),

      //OTHER
      type: "regular",
      level: "advanced",
    };
  }, [data?.data]);

  const methods = useForm({ defaultValues, values });
  const { handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: ICreateSessionPaylaod = {
        session_description: data?.description,
        session_name: data?.session_name,

        class_id: data?.class.value as string,
        capacity: parseInt(data?.capacity as string),
        instructor_id: data?.instructor?.value,
        level: data?.level as string,
        type: data?.type as string,
        place: data?.place as string,
        ...(data?.place === "offline"
          ? {
              location: data?.room.label as string,
              location_maps_url: data?.location_maps_url as string,
              room_id: data?.room.value as string,
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
      const res = await mutateAsync({ id: id as string, data: { ...payload } });
      if (res) {
        handleOpenModal("ONSUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  if (isLoading || !isFetched)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-semibold">Edit Session - {data?.data?.session_name}</h3>
        <p className="text-gray-500">Fill in the details to edit a session</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <SessionBasicInfoFormComponent />
            <div className="grid grid-cols-2 gap-2">
              <SessionDateTimeFormComponent start_date={values.start_date} />
              <SessionLocationFormComponent />
            </div>
            <SessionPricingFormComponent />
          </div>
          <div className="flex flex-row w-full items-center justify-end gap-4 mt-4">
            <div>
              <Button variant={"secondary"} type="button" onClick={() => handleOpenModal("ONCANCEL")}>
                Cancel
              </Button>
            </div>
            <div>
              <Button type="submit">Edit Session</Button>
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
          image="success-edit"
          onCancel={() => handleOpenModal("ONCANCEL")}
          hideCancel
          open={open.ONSUCCESS}
          title="Session Updated Successfully"
          subtitle="The session has been successfully updated."
          onConfirm={() => router.push(`/admin/session/${id}`)}
          cancelText="Session List"
          confirmText="Ok"
        />
      )}
    </div>
  );
};
