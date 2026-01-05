/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useDebounce } from "@/hooks";
import { useGetDiscountVouchers } from "@/hooks/api/queries/admin/discount-voucher";
import { formatCurrency } from "@/lib/helper";
import { TCategoryVoucher } from "@/types/discount-voucher.interface";
import { useState } from "react";
import Select from "react-select";

interface IProps {
  status: TCategoryVoucher;
  setSelectedVoucher: (data: any) => void;
  selecteValue: any;
}

export const DiscountSelectComponent = ({ status, selecteValue, setSelectedVoucher }: IProps) => {
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetDiscountVouchers({ page: 1, limit: 10, search: debounceSearch, status, is_active: "true" });

  const onSearch = (e: string) => {
    setSearch(e);
  };
  return (
    <div className="w-full">
      <Select
        options={data?.data}
        value={selecteValue}
        classNames={{
          control: () =>
            "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
          placeholder: () => "placeholder-gray-400",
          singleValue: () => "text-brand-999",
          input: () => "text-brand-999 bg-none",
        }}
        isLoading={isLoading}
        getOptionLabel={(option) =>
          `${option?.code} - ${option?.name} (${option.usage_count}/${option.usage_limit})  (${
            option.discount_type === "percentage" ? `${option.discount_value}%` : formatCurrency(option.discount_value)
          })`
        }
        getOptionValue={(opt) => opt.id}
        onInputChange={onSearch}
        onChange={(e) => {
          setSelectedVoucher(e);
        }}
      />
    </div>
  );
};
