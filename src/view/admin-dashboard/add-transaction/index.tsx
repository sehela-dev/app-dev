"use client";

import { DetailFormAddTransaction } from "./detail-form";
import { AddTransactionFOrm } from "./add-form";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";

export const AddTransactionPage = () => {
  const { stepper } = useAdminManualTransaction();
  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex flex-row items-center">
        <div className="flex flex-col w-full">
          <h3 className=" text-brand-999 text-3xl font-semibold">Add Transaction</h3>
          <p className="text-sm font-normal text-gray-500">Manually input transaction data for in-person purchases.</p>
        </div>
        <div className="max-w-9 max-h-9 w-full h-full  border  border-brand-100 rounded-full items-center justify-center p-2 ">
          <p className="text-[10px] font-semibold text-gray-500 leading-5 text-center">{stepper}/2</p>
        </div>
      </div>
      {stepper === 1 ? <AddTransactionFOrm /> : <DetailFormAddTransaction />}
    </div>
  );
};
