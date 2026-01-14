"use client";

import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { useDebounce } from "@/hooks";
import { useGetCustomers, useGetCustomerWallet } from "@/hooks/api/queries/admin/customers";
import { formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { ISessionItem } from "@/types/class-sessions.interface";
import { Loader2, PlusSquare } from "lucide-react";
import { useState } from "react";

interface IProps {
  selectedSession?: ISessionItem;
}

export const SelectStudentWithCreditComponent = ({ selectedSession }: IProps) => {
  const { customerData, addCustomer } = useAdminManualTransaction();

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data: customer, isLoading } = useGetCustomers({ page, limit, search: debounceSearch });
  const { data: walletCust, isLoading: loadingWallet } = useGetCustomerWallet({
    user: customerData?.id as string,
    session: selectedSession?.id as string,
  });
  const handleSearch = (query: string) => {
    setSearch(query);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <p className="text-2xl font font-semibold">Student List</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <SearchInput placeholder="Search Student" search={search} onSearch={handleSearch} />
            </div>
            <div className="">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                customer?.data?.map((item) => (
                  <div key={item.id}>
                    <div className="border border-brand-100 bg-brand-50 w-full rounded-lg px-4 py-2 mb-4" onClick={() => addCustomer(item)}>
                      <div className="flex flex-row items-center w-full justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-lg font-semibold">{item.full_name}</p>
                          <p className="text-sm text-gray-500 font-semibold">
                            {item.email} - {item.phone}
                          </p>
                          <p className="text-sm text-gray-500 font-semibold">Joined: {formatDateHelper(item.created_at, "dd MMM yyy")}</p>
                        </div>
                        <div>
                          <Button
                            size={"icon"}
                            onClick={() =>
                              addCustomer({
                                email: item.email,
                                name: item.full_name,
                                id: item.id,
                                phone: item.phone,
                              })
                            }
                          >
                            <PlusSquare />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {loadingWallet && customerData?.id === item.id ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        {walletCust?.data && (customerData?.id as string) === item.id && (
                          <div className="flex flex-col ml-4 mb-4">
                            {walletCust?.data?.eligible_packages?.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Select Credit</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {walletCust?.data.eligible_packages?.map((wallet) => (
                                    <div
                                      className={cn(
                                        "border border-brand-100 max-w-auto min-w-[250px]  max-h-[100px] rounded-lg px-4 py-2 hover:bg-brand-50  hover:border-brand-500 cursor-pointer",
                                        {
                                          "border-brand-500 bg-brand-50": wallet.package_purchase_id === customerData?.package?.package_purchase_id,
                                        },
                                      )}
                                      key={wallet.package_purchase_id}
                                      onClick={() =>
                                        addCustomer({
                                          email: item.email,
                                          name: item.full_name,
                                          id: item.id,
                                          phone: item.phone,
                                          package: wallet,
                                        })
                                      }
                                    >
                                      <div className="flex flex-col justify-center">
                                        <p className="text-md font-semibold text-gray-600">{wallet.package_name}</p>
                                        <p className="text-xs text-green-500 font-semibold">{wallet.credits_remaining} Credit</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="text-gray-500 text-sm">No Eligible Credit for this session</div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <CustomPagination
            onPageChange={(e) => {
              setPage(e);
            }}
            currentPage={page}
            showTotal
            hasPrevPage={customer?.pagination?.has_prev}
            hasNextPage={customer?.pagination?.has_next}
            totalItems={customer?.pagination?.total_items as number}
            totalPages={customer?.pagination?.total_pages as number}
            limit={limit}
          />
        </CardFooter>
      </Card>
    </>
  );
};
