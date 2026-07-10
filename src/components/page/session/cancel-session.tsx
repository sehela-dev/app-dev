import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { CustomTable } from "@/components/general/custom-table";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCancelSession } from "@/hooks/api/mutations/admin";
import { useGetRefundSessionList } from "@/hooks/api/queries/admin/class-session";
import { formatDateHelper, snakeToSpace } from "@/lib/helper";
import { IBookingList, IBookingRefundOverride } from "@/types/class-sessions.interface";
import { useEffect, useMemo, useState } from "react";

interface IProps {
  open: boolean;
  id: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_REFUND_VALIDITY_DAYS = 30;

export const CancelSessionComponent = ({ open, id, onClose, onSuccess }: IProps) => {
  const { data, isLoading } = useGetRefundSessionList(id, open);
  const { mutateAsync: cancelSession, isPending } = useCancelSession();

  const [cancelReason, setCancelReason] = useState("");
  const [bookingOverrides, setBookingOverrides] = useState<Record<string, IBookingRefundOverride>>({});

  useEffect(() => {
    if (!open) {
      setCancelReason("");
      setBookingOverrides({});
      return;
    }

    if (data?.data?.bookings) {
      const initialOverrides = data.data.bookings.reduce<Record<string, IBookingRefundOverride>>((acc, booking) => {
        acc[booking.booking_id] = {
          refund_type: booking.suggested_refund_type,
          ...(booking.suggested_refund_type === "credit_issue_new"
            ? { refund_validity_days: DEFAULT_REFUND_VALIDITY_DAYS }
            : {}),
        };
        return acc;
      }, {});

      setBookingOverrides(initialOverrides);
    }
  }, [open, data?.data?.bookings]);

  const updateBookingOverride = (bookingId: string, updates: Partial<IBookingRefundOverride>) => {
    setBookingOverrides((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        ...updates,
      },
    }));
  };

  const isConfirmDisabled = useMemo(() => {
    if (!cancelReason.trim() || isLoading || isPending) {
      return true;
    }

    const bookings = data?.data?.bookings ?? [];
    if (bookings.length === 0) {
      return true;
    }

    return bookings.some((booking) => {
      const override = bookingOverrides[booking.booking_id];
      if (!override?.refund_type) {
        return true;
      }

      if (override.refund_type === "manual_external") {
        return !override.refund_amount_idr || override.refund_amount_idr <= 0;
      }

      if (override.refund_type === "credit_issue_new") {
        return !override.refund_validity_days || override.refund_validity_days <= 0;
      }

      return false;
    });
  }, [bookingOverrides, cancelReason, data?.data?.bookings, isLoading, isPending]);

  const onConfirmCancel = async () => {
    const bookings = data?.data?.bookings ?? [];
    if (bookings.length === 0) {
      return;
    }

    const payloadOverrides = bookings.reduce<Record<string, IBookingRefundOverride>>((acc, booking) => {
      const override = bookingOverrides[booking.booking_id];
      const entry: IBookingRefundOverride = {
        refund_type: override.refund_type,
      };

      if (override.refund_type === "manual_external") {
        entry.refund_amount_idr = Number(override.refund_amount_idr);
      }

      if (override.refund_type === "credit_issue_new") {
        entry.refund_validity_days = Number(override.refund_validity_days);
      }

      acc[booking.booking_id] = entry;
      return acc;
    }, {});

    const defaultRefundType =
      bookingOverrides[bookings[0].booking_id]?.refund_type ?? bookings[0].suggested_refund_type;

    try {
      const res = await cancelSession({
        id,
        data: {
          confirm: true,
          cancel_reason: cancelReason.trim(),
          default_refund_type: defaultRefundType,
          refund_validity_days: DEFAULT_REFUND_VALIDITY_DAYS,
          booking_overrides: payloadOverrides,
        },
      });

      if (res) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const headers = [
    {
      id: "customer_name",
      text: "Customer Name",
      value: "customer_name",
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: IBookingList) => <p className="capitalize">{row.payment_method}</p>,
    },
    {
      id: "package_status",
      text: "Package/Status",
      value: (row: IBookingList) =>
        row?.package ? (
          <div className="flex flex-col">
            <p className="font-semibold text-brand-500 text-sm">{row.package?.credit_package?.name}</p>
            <p className="text-yellow-600">Expired at: {formatDateHelper(row.package?.expires_at, "dd MMM yyyy")}</p>
          </div>
        ) : (
          <p className="text-gray-400">No Package</p>
        ),
    },
  ];

  const actionOptions = {
    text: "Refund Type",
    show: true,
    render: (row: IBookingList) => {
      const override = bookingOverrides[row.booking_id];
      const refundType = override?.refund_type ?? row.suggested_refund_type;

      return (
        <div className="flex flex-col gap-2 min-w-[220px]">
          <Select
            onValueChange={(value) => {
              updateBookingOverride(row.booking_id, {
                refund_type: value,
                refund_amount_idr: undefined,
                refund_validity_days: value === "credit_issue_new" ? DEFAULT_REFUND_VALIDITY_DAYS : undefined,
              });
            }}
            value={refundType}
          >
            <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
              <SelectValue placeholder="Select Refund Type" className="!text-gray-400" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {row?.valid_refund_types?.map((item) => (
                  <SelectItem value={item} key={item}>
                    <p className="capitalize">{snakeToSpace(item)}</p>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {refundType === "manual_external" && (
            <Input
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
              type="number"
              min={0}
              placeholder="Refund Amount (IDR)"
              value={override?.refund_amount_idr ?? ""}
              onChange={(e) => {
                updateBookingOverride(row.booking_id, {
                  refund_amount_idr: e.target.value ? Number(e.target.value) : undefined,
                });
              }}
            />
          )}

          {refundType === "credit_issue_new" && (
            <Input
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
              type="number"
              min={1}
              placeholder="Refund Validity (days)"
              value={override?.refund_validity_days ?? DEFAULT_REFUND_VALIDITY_DAYS}
              onChange={(e) => {
                updateBookingOverride(row.booking_id, {
                  refund_validity_days: e.target.value ? Number(e.target.value) : undefined,
                });
              }}
            />
          )}
        </div>
      );
    },
  };

  return (
    <BaseDialogComponent
      isOpen={open}
      title="Cancel Session"
      btnConfirm="Confirm Cancel"
      onClose={onClose}
      onConfirm={onConfirmCancel}
      isDisabled={isConfirmDisabled}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <Label className="text-gray-500">Cancelation Reason</Label>
          <Input
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
            onChange={(e) => setCancelReason(e.target.value)}
            value={cancelReason}
            placeholder="Cancelation Reason"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-brand-500 text-md">Affected Bookings</h3>
          <Divider color="var(--color-gray-500)" />
        </div>
        <div>
          <CustomTable
            data={data?.data?.bookings}
            headers={headers}
            isLoading={isLoading}
            actionOptions={actionOptions}
          />
        </div>
      </div>
    </BaseDialogComponent>
  );
};
