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
