'use client'
import { CardRevenueComponent } from "@/components/page/dashboard/card-revenue"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDateHelper } from "@/lib/helper"
import { CircleDollarSign } from "lucide-react"


export const CashFlowView = () => {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold">Cash Flow | {formatDateHelper(new Date(), "EEEE, dd MMMM yyyy")}</h3>
          </div>

        </div>
      </div>
      <div className="flex flex-flex-row items-center justify-between gap-8">

        <CardRevenueComponent
          icon={
            <CircleDollarSign
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Revenue"
          amount={formatCurrency(123)}
        // percentage={20}
        />

        <CardRevenueComponent
          icon={
            <CircleDollarSign
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Revenue"
          amount={formatCurrency(123)}
        // percentage={20}
        />
        <CardRevenueComponent
          icon={
            <CircleDollarSign
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Revenue"
          amount={formatCurrency(123)}
        // percentage={20}
        />
      </div>

    </div>
  )
}