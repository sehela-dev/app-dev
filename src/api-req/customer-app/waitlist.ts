import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { IWaitlistResponse } from "@/types/customer-app/waitlist.interface";

// Idempotent on the backend: re-join is still 200.
export const joinWaitlist = async (sessionId: string): Promise<IWaitlistResponse> => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/profile/sessions/${sessionId}/waitlist`);
  return res.data;
};

export const getWaitlistStatus = async (sessionId: string): Promise<IWaitlistResponse> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/sessions/${sessionId}/waitlist`);
  return res.data;
};
