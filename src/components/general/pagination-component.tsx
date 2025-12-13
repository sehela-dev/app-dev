import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export interface ApiPagination {
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

interface CustomPaginationProps extends ApiPagination {
  onPageChange: (page: number) => void;
}

export function CustomPagination(props: CustomPaginationProps) {
  const { currentPage, totalItems, limit, hasNextPage, hasPrevPage, nextPage, previousPage, showTotal, onPageChange } = props;

  // --- NEW: compute the "Menampilkan X - Y dari Z data" range ---
  const hasData = totalItems > 0 && limit > 0;
  const start = hasData ? (currentPage - 1) * limit + 1 : 0;
  const end = hasData ? Math.min(currentPage * limit, totalItems) : 0;

  return (
    <div className="mt-2 flex flex-row items-center justify-between w-full text-gray-500">
      {showTotal && (
        <div className="flex w-full flex-nowrap">
          <p className="text-dashboard-200">
            {hasData ? (
              <>
                Showing{" "}
                <strong>
                  {start} - {end}
                </strong>{" "}
                of <strong>{totalItems}</strong> Data
              </>
            ) : (
              <>
                Showing <strong>0</strong> Data
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex w-full text-right ">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={!hasPrevPage}
                tabIndex={!hasPrevPage ? -1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  if (hasPrevPage) onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
            {hasPrevPage && (
              <PaginationItem>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange((currentPage - 1) as number);
                  }}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink
                isActive
                className="min-w-[44px]"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            {hasNextPage && (
              <PaginationItem>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange((currentPage + 1) as number);
                  }}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                aria-disabled={!hasNextPage}
                tabIndex={!hasNextPage ? -1 : 0}
                onClick={(e) => {
                  e.preventDefault();

                  if (hasNextPage) onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
