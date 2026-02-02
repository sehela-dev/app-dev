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
import { useCancelBooking, useChangeAttendanceStatus, useRescheduleSession } from "@/hooks/api/mutations/admin";
import { useGetSessionBookings, useGetSessionDetail, useGetSessions } from "@/hooks/api/queries/admin/class-session";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IParticipantsSession, ISessionItem } from "@/types/class-sessions.interface";
import { IAttendanceStatus } from "@/types/orders.interface";
import { BellRing, Ellipsis, File, Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CardSession } from "../../enrol-students";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const SessionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetSessionDetail(id as string);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
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
  const [selectedDataCancel, setSelectedDataCancel] = useState<string | null>(null);

  const { mutateAsync: rescheduleSession } = useRescheduleSession();

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };
  const { data: session, isLoading: loadingSession, refetch } = useGetSessionBookings({ id: id as string, page, limit: 10 });

  const { mutateAsync, isPending } = useChangeAttendanceStatus();
  const { mutateAsync: cancelBooking } = useCancelBooking();

  const onConfirmAttendance = async (id: string, status: IAttendanceStatus) => {
    try {
      const payload = {
        id,
        attendance_status: status,
      };
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res.data);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onTriggerCancel = (id: string) => {
    setSelectedDataCancel(id);
    setOpenCancel(true);
  };
  const onCancelBooking = async () => {
    try {
      const payload = {
        id: selectedDataCancel as string,
        refund_type: "credit_issue_new",
        cancel_reason: rescheduleNotes,
        refund_validity_days: 30,
      };
      const res = await cancelBooking(payload);
      if (res) {
        console.log(res.data);
        refetch();
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
      id: "medical_notes",
      text: "Medical Notes",
      value: (row: IParticipantsSession) => <p>{row?.medical_notes ?? "-"}</p>,
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

  const {
    data: sessionList,
    isLoading: loadingSessionReschedule,
    refetch: refetchSession,
  } = useGetSessions({
    page,
    limit,
    startDate: selectedRange.from,
    endDate: selectedRange.to,
    search: debounceClass,
    status: "scheduled",
  });

  const actionOptions = {
    text: "Action",
    show: data?.data?.status !== "canceled",
    render: (row: IParticipantsSession) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onConfirmAttendance(row.id, "attended")} disabled={isPending}>
            Check In
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onConfirmAttendance(row.id, "no_show")} className="text-red-500" disabled={isPending}>
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
          <DropdownMenuItem onClick={() => onTriggerCancel(row.id)} className="text-red-500" disabled={isPending}>
            Cancel Booking
          </DropdownMenuItem>
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
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold">Session Detail</h3>
            <p className="text-sm text-gray-500">Review all session details and make updates as needed</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div>
              <Button variant={"outline"}>
                <File /> Export
              </Button>
            </div>
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
              <h4 className="text-sm font-semibold">Participant</h4>
              <div>
                <Button>
                  <BellRing /> Remind All
                </Button>
              </div>
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

      <BaseDialogComponent
        isOpen={openCancel}
        title="Cancel Booking"
        buttonTriggerText="Cancel Booking"
        onConfirm={onCancelBooking}
        btnConfirm="Cancel Booking"
        onClose={() => {
          setOpenCancel(false);
        }}
      >
        <div className="flex flex-col gap-2">
          <Label>Notes</Label>
          <Textarea
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
            placeholder="Type here.."
            onChange={(e) => setRescheduleNotes(e.target.value)}
          />
        </div>
      </BaseDialogComponent>
    </Card>
  );
};
