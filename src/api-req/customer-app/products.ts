import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { IPublicProduct, IPublicProductsParams, TGetPublicProduct, TGetPublicProducts } from "@/types/customer-app/product.interface";

export const getPublicProducts: TGetPublicProducts = async (params = {}) => {
  const { success, data, pagination } = (
    await axiosx(false).get(`${MAIN_API_URL}/public/products`, {
      params: {
        page: params.page,
        page_size: params.page_size,
        ...(params.q ? { q: params.q } : null),
        ...(params.category_id ? { category_id: params.category_id } : null),
        ...(params.is_rentable !== undefined ? { is_rentable: params.is_rentable } : null),
      },
    })
  ).data;
  return { success, data, pagination };
};

export const getPublicProduct: TGetPublicProduct = async (id) => {
  const { data } = (await axiosx(false).get(`${MAIN_API_URL}/public/products/${id}`)).data;
  return data as IPublicProduct;
};

export type { IPublicProductsParams };
