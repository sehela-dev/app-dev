"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { InstructorPaymentModelForm } from "@/components/page/instructor-payment/form";
import {
  SessionBasicInfoFormComponent,
  SessionDateTimeFormComponent,
  SessionLocationFormComponent,
  SessionPricingFormComponent,
} from "@/components/page/session/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  payment: {
    payment_model: null,
    model_params: {
      percentage: 0,
      min_amount: 0,
      min_threshold_people: 0,
      amount: 0,
      credit_rate: 0,
      non_credit_rate: 0,
      base_amount: 0,
      additional_per_person: 0,
      base_people: 0,
      per_person_amount: 0,
    },
  },
};

export const OPTION_TYPE_KEY = {
  regular: "Regular",
  private: "Private",
  special: "Special",
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

  // useEffect(() => {
  //   const handler = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = "";
  //     // handleOpenModal("ONCANCEL");
  //   };

  //   window.addEventListener("beforeunload", handler);
  //   return () => window.removeEventListener("beforeunload", handler);
  // }, []);

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
      type: data?.data?.type,
      level: "advanced",
      ...(data?.data?.type === "private" || data?.data?.type === "special"
        ? {
            payment: {
              payment_model: data?.data?.instructor_payment_model,
              session_type: data?.data?.type,
              model_params: {
                percentage: data?.data?.instructor_payment_params?.percentage,
                min_amount: data?.data?.instructor_payment_params?.min_amount,
                min_threshold_people: data?.data?.instructor_payment_params?.min_threshold_people,
                amount: data?.data?.instructor_payment_params?.amount,
                credit_rate: data?.data?.instructor_payment_params?.credit_rate,
                non_credit_rate: data?.data?.instructor_payment_params?.non_credit_rate,
                base_amount: data?.data?.instructor_payment_params?.base_amount,
                additional_per_person: data?.data?.instructor_payment_params?.additional_per_person,
                base_people: data?.data?.instructor_payment_params?.base_people,
                per_person_amount: data?.data?.instructor_payment_params?.per_person_amount,
              },
            },
          }
        : { payment: null }),
    };
  }, [data?.data]);

  const methods = useForm({ defaultValues, values });
  const { handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
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
        ...(data?.type === "private" || data?.type === "special"
          ? {
              payment: {
                payment_model: data?.payment?.payment_model,
                session_type: data?.type,
                model_params: {
                  percentage: data?.payment?.model_params?.percentage as number,
                  min_amount: data?.payment?.model_params?.min_amount as number,
                  min_threshold_people: data?.payment?.model_params?.min_threshold_people as number,
                  amount: data?.payment?.model_params?.amount as number,
                  credit_rate: data?.payment?.model_params?.credit_rate as number,
                  non_credit_rate: data?.payment?.model_params?.non_credit_rate as number,
                  base_amount: data?.payment?.model_params?.base_amount as number,
                  additional_per_person: data?.payment?.model_params?.additional_per_person as number,
                  base_people: data?.payment?.model_params?.base_people as number,
                  per_person_amount: data?.payment?.model_params?.per_person_amount as number,
                },
              },
            }
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { payment: null as any }),
      };
      const res = await mutateAsync({ id: id as string, data: { ...payload } });
      if (res) {
        handleOpenModal("ONSUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  // useEffect(() => {
  //   if (data?.data) {
  //     methods.setValue("payment", {
  //       payment_model: data?.data?.instructor_payment_model,
  //       session_type: data?.data?.type,
  //       model_params: {
  //         percentage: data?.data?.instructor_payment_params?.percentage,
  //         min_amount: data?.data?.instructor_payment_params?.min_amount,
  //         min_threshold_people: data?.data?.instructor_payment_params?.min_threshold_people,
  //         amount: data?.data?.instructor_payment_params?.amount,
  //         credit_rate: data?.data?.instructor_payment_params?.credit_rate,
  //         non_credit_rate: data?.data?.instructor_payment_params?.non_credit_rate,
  //         base_amount: data?.data?.instructor_payment_params?.base_amount,
  //         additional_per_person: data?.data?.instructor_payment_params?.additional_per_person,
  //         base_people: data?.data?.instructor_payment_params?.base_people,
  //         per_person_amount: data?.data?.instructor_payment_params?.per_person_amount,
  //       },
  //     });
  //   }
  // }, [data?.data, methods]);

  console.log(methods.watch("payment"));

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
            <SessionBasicInfoFormComponent type={values?.type} />
            {/* {(methods.watch("type") === "special" || methods.watch("type") === "private") && ( */}
            <Card>
              <CardHeader hidden></CardHeader>
              <CardContent>
                <InstructorPaymentModelForm
                  label={"Overide payment model"}
                  prefix={"payment"}
                  payment_model={values?.payment?.payment_model as string}
                />
              </CardContent>
            </Card>
            {/* )} */}
            <div className="grid grid-cols-2 gap-2">
              <SessionDateTimeFormComponent start_date={values.start_date} isEdit />
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
