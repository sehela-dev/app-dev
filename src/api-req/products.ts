import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TProductItemList } from "@/types/product.interface";

export const getProductList: TProductItemList = async ({ page, limit, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
    },
  });
  return res.data;
};
