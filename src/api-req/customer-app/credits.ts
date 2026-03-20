import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TMyCreditResponse } from "@/types/customer-app/my-credit.interface";

export const getMyCredits: TMyCreditResponse = async () => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages/my-packages`, {
    params: {},
  });
  return res.data;
};
