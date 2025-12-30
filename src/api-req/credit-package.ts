import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TCreatePackage, TCreditPackageDetail, TCreditPackages, TEditPackage } from "@/types/credit-package.interface";

export const getCreditPackages: TCreditPackages = async ({ page, limit, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
    },
  });
  return res.data;
};

export const createPackage: TCreatePackage = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/credit-packages`, data);

  return res.data;
};

export const getCreditPackage: TCreditPackageDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages/${id}`);
  return res.data;
};

export const editPackage: TEditPackage = async ({ id, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/credit-packages/${id}`, data);

  return res.data;
};

export const deletePackage: TCreditPackageDetail = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/credit-packages/${id}`);

  return res.data;
};
