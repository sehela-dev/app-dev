import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TCreateProduct, TInventoryLocations, TProductCategories, TProductItemList } from "@/types/product.interface";

export const getProductList: TProductItemList = async ({ page, limit, search, view, is_rentable }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      ...(view ? { view } : null),
      ...(is_rentable ? { is_rentable } : null),
    },
  });
  return res.data;
};

export const createProduct: TCreateProduct = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/products`, data);
  return res.data;
};

// product category
export const getProductCategoryList: TProductCategories = async ({ page, limit }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/categories`, {
    params: {
      page,
      page_size: limit,
    },
  });
  return res.data;
};

//branch
export const getInventoryLocations: TInventoryLocations = async (data) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/inventory-locations`, {
    params: {
      ...(data?.category_id ? { category_id: data?.category_id } : null),
      ...(data?.product_id ? { product_id: data?.product_id } : null),
    },
  });
  return res.data;
};
