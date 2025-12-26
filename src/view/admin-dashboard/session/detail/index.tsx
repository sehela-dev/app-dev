"use client";

import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetSessionBookings, useGetSessionDetail } from "@/hooks/api/queries/admin/class-session";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IParticipantsSession } from "@/types/class-sessions.interface";
import { BellRing, File, Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export const SessionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetSessionDetail(id as string);
  const [page, setPage] = useState(1);

  const { data: session, isLoading: loadingSession } = useGetSessionBookings({ id: id as string, page, limit: 10 });

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
        <p
          className={cn({
            "text-gray-500": !row.attendance_status,
          })}
        >
          {row.attendance_status ?? "Not Checked In"}
        </p>
      ),
    },
  ];

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
    </Card>
  );
};
