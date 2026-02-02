"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { CustomTable } from "@/components/general/custom-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetInstructorSessionPaymentDetails } from "@/hooks/api/queries/admin/instructor";
import { ChartSpline, DollarSign, Loader2, Tag } from "lucide-react";
import { CardRevenueComponent } from "../../dashboard";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { IBookingPaymentDetail } from "@/types/instructor.interface";

interface IProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InstructorPaymentDetailComponent = ({ id, isOpen, onClose }: IProps) => {
  const { data, isLoading } = useGetInstructorSessionPaymentDetails(id as string);

  const headers = [
    {
      id: "customer-name",
      text: "Customer Name",
      value: "customer_name",
    },
    {
      id: "payment-methods",
      text: "Payment Mehtod",
      value: "payment_method",
    },
    {
      id: "revenue_idr",
      text: "Revenue",

      value: (row: IBookingPaymentDetail) => formatCurrency(row.revenue_idr),
    },
    {
      id: "attendance_status",
      text: "Attendance",
      value: (row: IBookingPaymentDetail) => (
        <p className="capitalize italic text-gray-500">{row?.attendance_status ? row.attendance_status : "No Confirmation"}</p>
      ),
    },
    {
      id: "created_at",
      text: "Time",
      value: (row: IBookingPaymentDetail) => formatDateHelper(row.created_at, "dd/MM/yyyy H:mm"),
    },
  ];

  return (
    <BaseDialogComponent isOpen={isOpen} title="" btnConfirm="Close" onConfirm={onClose}>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <p className="font-semibold text-2xl">Instructor Session Payment Details</p>
          </div>
          {/* session detail */}
          <Divider />

          <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">Session Info</p>
            <div className="grid grid-cols-12 gap-2">
              <p className="col-span-2">Session Name</p>

              <p className="col-span-10">
                [{data?.data?.session?.session_code}] - {data?.data?.session?.session_name}
              </p>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <p className="col-span-2">Class</p>
              <p className="col-span-10">{data?.data?.session?.class_name ?? "-"}</p>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <p className="col-span-2">Instructor</p>
              <p className="col-span-10">{data?.data?.session?.instructor_name}</p>
            </div>
          </div>
          <Divider className="my-2" />

          {/* payment summary */}
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-xl">Payment Summary</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <CardRevenueComponent
                  icon={
                    <Tag
                      style={{
                        color: "var(--color-gray-400)",
                      }}
                      size={18}
                    />
                  }
                  title="Total Booking"
                  amount={String(data?.data?.payment?.total_bookings)}
                  // percentage={20}
                />
              </div>
              <div className="col-span-4">
                <CardRevenueComponent
                  icon={
                    <ChartSpline
                      style={{
                        color: "var(--color-gray-400)",
                      }}
                      size={18}
                    />
                  }
                  title="Total Revenue"
                  amount={formatCurrency(String(data?.data?.payment?.total_revenue))}
                  // percentage={20}
                />
              </div>
              <div className="col-span-4">
                <CardRevenueComponent
                  icon={
                    <DollarSign
                      style={{
                        color: "var(--color-gray-400)",
                      }}
                      size={18}
                    />
                  }
                  title="Teacher Pay"
                  amount={formatCurrency(String(data?.data?.payment?.calculated_payment))}

                  // percentage={20}
                />
              </div>
            </div>
          </div>
          <Divider className="my-2" />
          <div className="mt-4">
            <Card>
              <CardHeader>
                <p className="font-semibold text-xl">Bookings</p>
              </CardHeader>
              <CardContent>
                <CustomTable headers={headers} data={data?.data?.bookings ?? []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </BaseDialogComponent>
  );
};
