export interface IPagination {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
  limit: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number | null;
  previousPage?: number | null;
  showTotal?: boolean;
}

export interface ICommonParams {
  id?: string;
  page?: number;
  limit?: number;
  search?: string;
  payment_method?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort_by?: string;
  is_active?: string | boolean;
}
