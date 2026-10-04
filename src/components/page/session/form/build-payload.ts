"use client";

import { createFormData } from "@/lib/helper";
import { ICreateSessionPaylaod } from "@/types/class-sessions.interface";

export const createSessionDefaultValues = {
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
  start_date: "",
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
  is_credit_only: false,
  photo: null as File | null,
  photo_url: "",
  is_recurring: "no",
  recurring_type: "",
  recurring_count: "0",

  //OTHER
  type: "regular",
  level: "all_levels",
  isOveride: false,
  payment: {
    payment_model: "",
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

export type CreateSessionFormData = typeof createSessionDefaultValues;

// Single source for the create payload; used by the full page and the
// calendar quick-create sheet alike.
export const buildSessionPayload = (data: CreateSessionFormData): ICreateSessionPaylaod | FormData => {
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
    price_idr: data?.is_credit_only ? 0 : parseInt(data?.price_idr),
    price_credit_amount: parseInt(data?.price_credit_amount),
    is_credit_only: !!data?.is_credit_only,
    start_date: data?.start_date as string,
    time_start: data?.time_start as string,
    time_end: data?.time_end as string,

    ...(data?.isOveride && (data?.type === "private" || data?.type === "special")
      ? {
          payment: {
            payment_model: data?.payment?.payment_model,
            session_type: data?.type,
            model_params: {
              percentage: +data?.payment?.model_params?.percentage as number,
              min_amount: +data?.payment?.model_params?.min_amount as number,
              min_threshold_people: +data?.payment?.model_params?.min_threshold_people as number,
              amount: +data?.payment?.model_params?.amount as number,
              credit_rate: +data?.payment?.model_params?.credit_rate as number,
              non_credit_rate: +data?.payment?.model_params?.non_credit_rate as number,
              base_amount: +data?.payment?.model_params?.base_amount as number,
              additional_per_person: +data?.payment?.model_params?.additional_per_person as number,
              base_people: +data?.payment?.model_params?.base_people as number,
              per_person_amount: +data?.payment?.model_params?.per_person_amount as number,
            },
          },
        }
      : null),
  };

  // File takes precedence over URL per API contract; use multipart when file selected
  const hasFile = data?.photo instanceof File;
  if (hasFile) return createFormData({ ...payload, photo: data.photo as File });
  if (data?.photo_url) return { ...payload, photo_url: data.photo_url as string };
  return payload;
};
