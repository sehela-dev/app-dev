import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  ICreateBookingRequest,
  IEligibleCreditsParams,
  TCreateBooking,
  TEligibleCreditsResponse,
} from "@/types/customer-app/booking.interface";

export const getEligibleCredits: TEligibleCreditsResponse = async (params: IEligibleCreditsParams) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages/eligible`, {
    params,
  });
  return res.data;
};

export const createBooking: TCreateBooking = async (body: ICreateBookingRequest) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/profile/bookings`, body);
  return res.data;
};
