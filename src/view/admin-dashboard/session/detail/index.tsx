"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks";
import { useCancelBooking, useChangeAttendanceStatus, useRescheduleSession, useSendReminderSession } from "@/hooks/api/mutations/admin";
import { useGetSessionBookings, useGetSessionDetail, useGetSessions } from "@/hooks/api/queries/admin/class-session";
import { defaultDate, formatCurrency, formatDateHelper, reminderMessage, sendReminder } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IParticipantsSession, ISessionItem } from "@/types/class-sessions.interface";
import { IAttendanceStatus } from "@/types/orders.interface";
import { ArrowLeftRight, Ban, Banknote, BellRing, Copy, Ellipsis, Loader2, LucideIcon, PenIcon, RotateCcw, WalletCards, X } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { CardSession } from "../../enrol-students";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BackButtonComponent } from "@/components/general/back-button";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAdminPermission } from "@/hooks/use-role-access";
type RefundType = "none" | "credit_return" | "credit_issue_new" | "manual_external"

const refundOptions: {
  value: RefundType
  title: string
  description: string
  icon: React.ReactElement
}[] = [
    {
      value: "none",
      title: "No refund",
      description: "For no-shows or policy violations",
      icon: <Ban />,
    },
    {
      value: "credit_return",
      title: "Return package credits",
      description: "Restore the credit to the original package",
      icon: <ArrowLeftRight />,
    },
    {
      value: "credit_issue_new",
      title: "Issue new credits",
      description: "Create fresh credits with an expiry date",
      icon: <WalletCards />,
    },
    {
      value: "manual_external",
      title: "External cash refund",
      description: "Record a refund handled outside the platform",
      icon: <Banknote />,
    },
  ]


export const SessionDetailPage = () => {
  const router = useRouter();
  const { isManager } = useAdminPermission()
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetSessionDetail(id as string);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [validityDays, setValidityDays] = useState(15)
  const [refundAmount, setRefundAmount] = useState(0)
  // resechedule
  const [limit] = useState(6);
  const [pageSession, setPageSession] = useState(1);
  const [selectedSession, setSelectedSession] = useState<ISessionItem | null>(null);
  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedToday,
    to: defaultDate().formattedOneMonthLater,
    // from: "2026-01-01",
    // to: "2026-02-01",
  });
  const [search, setSearch] = useState("");
  const debounceClass = useDebounce(search, 300);
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [openCancel, setOpenCancel] = useState(false);
  const [refundType, setRefundTYpe] = useState("none")
  const [selectedDataCancel, setSelectedDataCancel] = useState<IParticipantsSession | null>(null);
  const [pendingAttendance, setPendingAttendance] = useState<{ id: string; status: IAttendanceStatus } | null>(null);

  const { mutateAsync: rescheduleSession } = useRescheduleSession();

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };
  const { data: session, isLoading: loadingSession, refetch } = useGetSessionBookings({ id: id as string, page, limit: 10 });

  const { mutateAsync, isPending } = useChangeAttendanceStatus();
  const { mutateAsync: cancelBooking } = useCancelBooking();
  const [openReminder, setOpenReminder] = useState(false);
  const { mutateAsync: remindAll } = useSendReminderSession();

  const onConfirmAttendance = async (id: string, status: IAttendanceStatus) => {
    try {
      const payload = {
        id,
        attendance_status: status,
      };
      const res = await mutateAsync(payload);
      if (res) {
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onRequestAttendanceChange = (id: string, status: IAttendanceStatus) => {
    setPendingAttendance({ id, status });
  };
  const onConfirmAttendanceChange = async () => {
    if (!pendingAttendance) return;
    await onConfirmAttendance(pendingAttendance.id, pendingAttendance.status);
    setPendingAttendance(null);
  };

  const onTriggerCancel = (row: IParticipantsSession) => {
    setSelectedDataCancel(row);
    setRefundAmount(row?.payment_method === "cash" ? (row?.paid_with?.revenue_idr ?? 0) : 0);
    const packageExpiry = row?.paid_with?.package_expires_at;
    setValidityDays(packageExpiry ? Math.max(differenceInCalendarDays(new Date(packageExpiry), new Date()), 0) : 15);
    setOpenCancel(true);
  };
  const onCancelBooking = async () => {
    try {
      const payload = {
        id: selectedDataCancel?.id as string,
        refund_type: refundType,
        cancel_reason: rescheduleNotes.trim(),
        ...(refundType === "credit_issue_new" && {
          refund_validity_days: Number(validityDays),
        }),
        ...(refundType === "manual_external" && {
          refund_amount_idr: Number(refundAmount),
        }),
      };
      const res = await cancelBooking(payload);
      if (res) {
        refetch();
        setOpenCancel(false);
        setSelectedDataCancel(null);
        setRescheduleNotes("")
        setRefundTYpe("none")
        setValidityDays(15)
        setRefundAmount(0)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOpenCancel(false);
      setSelectedDataCancel(null);
    }
  };

  const headers = [
    {
      id: "customer_name",
      text: "Customer Name",
      value: (row: IParticipantsSession) => (
        <div className="flex flex-row gap-2 w-full">
          <p>{row?.customer_name}</p>
          <Button
            className="w-6 h-6"
            variant={"outline"}
            onClick={() => {
              navigator.clipboard.writeText(row?.customer_name);
              return toast.success("Name copied!", {
                id: "error",
                position: "top-center",
              });
            }}
          >
            <Copy />
          </Button>
        </div>
      ),
    },
    {
      id: "customer_phone",
      text: "WhatsApp",
      value: "customer_phone",
    },
    {
      id: "customer_email",
      text: "Email",
      value: "customer_email",
    },
    {
      id: "photo_consent",
      text: "Photo Concent",
      value: (row: IParticipantsSession) => <p>{row?.photo_consent ? "Yes" : "No"}</p>,
    },
    {
      id: "instagram_username",
      text: "Instagram",
      value: (row: IParticipantsSession) => <p>{row?.instagram_username ?? "-"}</p>,
    },
    {
      id: "medical_notes",
      text: "Medical Notes",
      value: (row: IParticipantsSession) => <p>{row?.medical_notes ?? "-"}</p>,
    },
    {
      id: "reminder",
      text: "Send Reminder",
      value: (row: IParticipantsSession) => (
        <div className="flex w-full items-center">
          <Button
            className="w-8 h-8"
            onClick={() => {
              const msg = reminderMessage(
                row.customer_name,
                data?.data?.session_name as string,
                `${data?.data?.time_start} - ${data?.data?.time_end}`,
                `${data?.data?.location}`,
              );
              sendReminder(row?.customer_phone.trim(), msg);
            }}
            disabled={data?.data?.status === "ended" || data?.data?.status === "cancelled"}
          >
            <BellRing />
          </Button>
        </div>
      ),
    },

    {
      id: "attendance_status",
      text: "Attendance",
      value: (row: IParticipantsSession) => (
        <div className="">
          {!row.attendance_status ? (
            <p className="italic text-gray-500">No Confirmation</p>
          ) : (
            <p
              className={cn({
                "text-green-500": row.attendance_status === "attended",
                "text-red-500": row.attendance_status === "no_show",
              })}
            >
              {row.attendance_status === "attended" ? "Checked In" : "No Show"}
            </p>
          )}
        </div>
      ),
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPageSession(1);
    setRescheduleNotes("");
    setSelectedRow(null);
    setSelectedSession(null);
    refetch();
    refetchSession();
    setSearch("");
  };
  const onClickReminder = () => {
    setOpenReminder(true);
  };
  const onRemindAll = async () => {
    try {
      const res = await remindAll(id as string);
      if (res) {
        console.log(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setOpenReminder(false);
    }
  };

  const {
    data: sessionList,
    isLoading: loadingSessionReschedule,
    refetch: refetchSession,
  } = useGetSessions({
    page: pageSession,
    limit: 6,
    startDate: selectedRange.from,
    endDate: selectedRange.to,
    search: debounceClass,
    status: "scheduled",
  });

  const actionOptions = {
    text: "Action",
    // show: data?.data?.status !== "ended",
    show: true,
    render: (row: IParticipantsSession) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onRequestAttendanceChange(row.id, "attended")} disabled={isPending}>
            Check In
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRequestAttendanceChange(row.id, "no_show")} className="text-red-500" disabled={isPending}>
            No Show
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpenDialog(true);
              setSelectedRow(row.id);
            }}
          >
            Reschedule
          </DropdownMenuItem>
          {(row.booking_status !== "cancelled" && row.booking_status !== "canceled" && row.payment_status !== "voided") &&
          ((row.attendance_status === 'attended' && isManager) || !row.attendance_status) ?
            <DropdownMenuItem onClick={() => onTriggerCancel(row)} className="text-red-500" disabled={isPending}>
              Cancel Booking
            </DropdownMenuItem> : ""
          }
          {isManager ? <DropdownMenuItem onClick={() => onRequestAttendanceChange(row.id, null)} className="bg-secondary" disabled={isPending}>
            <RotateCcw /> Reset
          </DropdownMenuItem> : ""}

        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const onResheduleSession = async () => {
    try {
      const payload = {
        id: selectedRow as string,
        new_session_id: selectedSession?.id as string,
        notes: rescheduleNotes as string,
      };
      const res = await rescheduleSession(payload);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCloseDialog();
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center w-full justify-between">
          <BackButtonComponent page="/admin/session">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-4">
                <h3 className="text-2xl font-semibold items-center">Session Detail</h3>
                <Badge
                  className={cn("capitalize font-bold", {
                    "text-green-500": data?.data?.status === "ongoing",
                    "text-blue-500": data?.data?.status === "scheduled",
                    "text-red-500": data?.data?.status === "ended",
                    "text-yellow-500": data?.data?.status === "canceled",
                  })}
                  variant={"outline"}
                >
                  {data?.data?.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-500">Review all session details and make updates as needed</p>
            </div>
          </BackButtonComponent>

          <div className="flex flex-row items-center gap-2">
            {/* <div>
              <Button variant={"outline"}>
                <File /> Export
              </Button>
            </div> */}
            <div>
              <Button onClick={() => router.push(`${id}/edit`)}>
                <PenIcon /> Edit
              </Button>
            </div>
          </div>
        </div>
        <Divider className="my-2" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">Basic Information</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="grid col-span-3 text-gray-500">Session ID</div>
              <div className="grid col-span-9">{data?.data?.session_id}</div>
              <div className="grid col-span-3 text-gray-500">Session Name</div>
              <div className="grid col-span-9">{data?.data?.session_name}</div>
              <div className="grid col-span-3 text-gray-500">Capacity</div>
              <div className="grid col-span-9">{data?.data?.capacity}</div>
              <div className="grid col-span-3 text-gray-500">Class Category</div>
              <div className="grid col-span-9">{data?.data?.class?.class_name}</div>
              <div className="grid col-span-3 text-gray-500">Instructor</div>
              <div className="grid col-span-9">{data?.data?.instructor_name}</div>
              <div className="grid col-span-3 text-gray-500">Description</div>
              <div className="grid col-span-9">{data?.data?.session_description}</div>
            </div>
          </div>
          <Divider className="my-2" />

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">Date & Time</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="grid col-span-3 text-gray-500">Start Date</div>
              <div className="grid col-span-9">{formatDateHelper(data?.data?.start_date as string, "dd MMM yyyy")}</div>
              <div className="grid col-span-3 text-gray-500">Time</div>
              <div className="grid col-span-9">
                {data?.data?.time_start} - {data?.data?.time_end}
              </div>
              <div className="grid col-span-3 text-gray-500">Location Type</div>
              <div className="grid col-span-9 capitalize">{data?.data?.place}</div>
              <div className="grid col-span-3 text-gray-500">Location Details</div>
              <div className="grid col-span-9">{data?.data?.location}</div>
              <div className="grid col-span-3 text-gray-500">Location Maps Url</div>
              <div className="grid col-span-9">
                <a href={data?.data.location_maps_url} target="_blank" className="text-blue-500 underline">
                  {data?.data?.location_address ?? data?.data?.location}
                </a>
              </div>
            </div>
          </div>
          <Divider className="my-2" />

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">Pricing</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="grid col-span-3 text-gray-500">Regular Price</div>
              <div className="grid col-span-9">{formatCurrency(data?.data?.price_idr)}</div>
              <div className="grid col-span-3 text-gray-500">Credit Price</div>
              <div className="grid col-span-9">{data?.data?.price_credit_amount} Credit</div>
              <div className="grid col-span-3 text-gray-500">Discount</div>
              {/* <div className="grid col-span-9">{data?.data?.place}</div> */}
              <div className="grid col-span-9">-</div>
              <div className="grid col-span-3 text-gray-500">Discount Price</div>
              {/* <div className="grid col-span-9">Value</div> */}
              <div className="grid col-span-9">-</div>
            </div>
          </div>
          <Divider className="my-2" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <h4 className="text-sm font-semibold">Participants</h4>
              {/* {data?.data?.status !== 'canceled' && data?.data?.status !== 'ended' &&
                <div>
                  <Button onClick={() => {
                    onClickReminder()
                  }}>
                    <BellRing /> Remind All
                  </Button>
                </div>
              } */}
            </div>
            <div className="flex flex-col gap-2">
              <CustomTable
                data={session?.data ?? []}
                headers={headers}
                // numberOptions={numberOptions}
                isLoading={loadingSession}
                // setSelectedData={setSelectedData}
                // selectedData={selectedData}
                actionOptions={actionOptions}
              />
              <CustomPagination
                onPageChange={(e) => {
                  setPage(e);
                }}
                currentPage={page}
                showTotal
                hasPrevPage={session?.pagination?.has_prev}
                hasNextPage={session?.pagination?.has_next}
                totalItems={session?.pagination?.total_items as number}
                totalPages={session?.pagination?.total_pages as number}
                limit={10}
              />
            </div>
          </div>
        </div>
      </CardContent>
      {openDialog &&
        <BaseDialogComponent
          title="Reschedule"
          isOpen={openDialog}
          btnConfirm="Proceed"
          onClose={() => {
            handleCloseDialog();
          }}
          onConfirm={onResheduleSession}
        >
          <div className="flex flex-col gap-2">
            <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
            <div className="flex flex-row items-center gap-4">
              <div className="w-full flex flex-col gap-1">
                <p className="text-sm font-medium">Date From</p>
                <DateRangePicker
                  mode="single"
                  onDateRangeChange={(e) => handleDateRangeChangeDual(e)}
                  startDate={selectedRange.from}
                  allowFutureDates
                  allowPastDates={false}
                />
              </div>
              <div className="w-full">
                <p className="text-sm font-medium">Date to</p>
                <DateRangePicker
                  mode="single"
                  onDateRangeChange={(e) => handleDateRangeChangeDual(selectedRange.from, e)}
                  startDate={selectedRange.to}
                  allowFutureDates
                  allowPastDates={false}
                />
              </div>
            </div>
            <div className="w-full flex-col gap-2">
              {loadingSessionReschedule ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (sessionList?.data?.length as number) > 0 ? (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {sessionList?.data?.map((item) =>
                    item.id !== id ? (
                      <CardSession
                        key={item.id}
                        date={formatDateHelper(item.start_datetime, "dd/MM/yyyy")}
                        instructor={item.instructor_name}
                        time={`${item.time_start} - ${item.time_end}`}
                        slot={item.slots_display}
                        title={`[${item?.class?.class_name}] - ${item.session_name}`}
                        onSelect={() => setSelectedSession(item)}

                        status={item.location}
                        isSelected={item.id === selectedSession?.id}
                      />
                    ) : null,
                  )}
                </div>
              ) : (
                <div className="italic flex flex-row items-center justify-center w-full">No Data Found</div>
              )}
            </div>
            <CustomPagination
              onPageChange={(e) => {
                setPageSession(e);

              }}
              currentPage={pageSession}
              showTotal
              hasPrevPage={sessionList?.pagination?.has_prev}
              hasNextPage={sessionList?.pagination?.has_next}
              totalItems={sessionList?.pagination?.total_items as number}
              totalPages={sessionList?.pagination?.total_pages as number}
              limit={limit}
            />
            {selectedSession && (
              <div className="flex flex-col gap-2">
                <Label>Notes</Label>
                <Textarea
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                  placeholder="Type here.."
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                />
              </div>
            )}
          </div>
        </BaseDialogComponent>
      }
      {openCancel &&

        <BaseDialogComponent
          isOpen={openCancel}
          title="Cancel Booking"
          buttonTriggerText="Cancel Booking"
          onConfirm={onCancelBooking}
          btnConfirm="Cancel Booking"
          onClose={() => {
            setOpenCancel(false);
            setRefundTYpe("none")
            setValidityDays(15)
            setRefundAmount(0)
            setRescheduleNotes("")
          }}
        >

          <RadioGroup value={refundType} onValueChange={(v) => setRefundTYpe(v)}>
            <div className="grid grid-cols-2 gap-2">
              {refundOptions?.map((option) => (
                <div key={option.value} className={cn("flex items-center space-x-2 border border-brand-400 rounded-xl p-4", {
                  "border-2 bg-brand-50": refundType === option.value
                })}>
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-medium text-brand-999 cursor-pointer">
                    <div className="flex flex-row items-center gap-4">
                      {option.icon}
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-xl">{option.title}</p>
                        <p className="font-normal">{option.description}</p>
                      </div>
                    </div>

                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {refundType === "credit_issue_new" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="validity-days">Credit validity</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="validity-days"
                  type="number"
                  min="0"
                  value={validityDays}
                  readOnly={!!selectedDataCancel?.paid_with?.package_expires_at}
                  onChange={(event) => setValidityDays(parseInt(event.target.value))}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">days from cancellation</span>
              </div>
              {selectedDataCancel?.paid_with?.package_expires_at && (
                <p className="text-xs text-muted-foreground">
                  Expiry matches original package: {formatDateHelper(selectedDataCancel.paid_with.package_expires_at, "dd MMM yyyy")}
                </p>
              )}
            </div>
          )}

          {refundType === "manual_external" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="refund-amount">Refund amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">IDR</span>
                <Input
                  id="refund-amount"
                  type="number"
                  min="1"
                  placeholder="150000"
                  value={refundAmount || ""}
                  readOnly={selectedDataCancel?.payment_method === "cash"}
                  onChange={(event) => setRefundAmount(parseInt(event.target.value))}
                />
              </div>
              {selectedDataCancel?.payment_method === "cash" && (
                <p className="text-xs text-muted-foreground">Refund amount is prefilled from the cash payment received.</p>
              )}
            </div>
          )}




          <div className="flex flex-col gap-2">
            <Label>Notes</Label>
            <Textarea
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
              placeholder="Type here.."
              onChange={(e) => setRescheduleNotes(e.target.value)}
            />
          </div>
        </BaseDialogComponent>
      }
      {
        openReminder && (
          <BaseDialogConfirmation
            open={openReminder}
            title="Send Reminder to all participants?"
            subtitle="Participants will be receive email according this session"
            onConfirm={onRemindAll}
            confirmText="Remind All"
            onCancel={() => setOpenReminder(false)}
            image="warning-1"
          />
        )
      }
      {pendingAttendance && (
        <BaseDialogConfirmation
          open={!!pendingAttendance}
          title={
            pendingAttendance.status === "attended"
              ? "Confirm Check In"
              : pendingAttendance.status === "no_show"
                ? "Confirm No Show"
                : "Confirm Reset Attendance"
          }
          subtitle={
            pendingAttendance.status === "attended"
              ? "Mark this participant as attended?"
              : pendingAttendance.status === "no_show"
                ? "Mark this participant as no show?"
                : "Reset this participant's attendance status? This action cannot be undone."
          }
          onConfirm={onConfirmAttendanceChange}
          confirmText={pendingAttendance.status ? "Confirm" : "Reset"}
          onCancel={() => setPendingAttendance(null)}
          image="warning-1"
        />
      )}
    </Card >
  );
};
