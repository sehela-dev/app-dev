import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TCreatePackage, TCreditPackageDetail, TCreditPackages, TEditPackage } from "@/types/credit-package.interface";

export const getCreditPackages: TCreditPackages = async ({ page, limit, search, is_active, is_visible, session_type, place, class_id }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      ...(is_active !== undefined && is_active !== "all" ? { is_active } : null),
      ...(is_visible !== undefined && is_visible !== "all" ? { is_visible } : null),
      ...(session_type && session_type !== "all" ? { session_type } : null),
      ...(place && place !== "all" ? { place } : null),
      ...(class_id && class_id !== "all" ? { class_id } : null),
    },
  });
  return res.data;
};

// Public storefront catalog (A1) — no login; server forces is_active=true AND is_visible=true.
export const getPublicCreditPackages: TCreditPackages = async ({ page, limit, search, session_type, place, class_id }) => {
  const res = await axiosx(false).get(`${MAIN_API_URL}/credit-packages`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      ...(session_type && session_type !== "all" ? { session_type } : null),
      ...(place && place !== "all" ? { place } : null),
      ...(class_id && class_id !== "all" ? { class_id } : null),
    },
  });
  return res.data;
};

// Public detail (A2) — hidden/inactive → 404. Use axiosx(false) so direct links work logged-out.
export const getPublicCreditPackage: TCreditPackageDetail = async (id) => {
  const res = await axiosx(false).get(`${MAIN_API_URL}/credit-packages/${id}`);
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
