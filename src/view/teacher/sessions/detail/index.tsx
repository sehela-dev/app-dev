"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherSessionDetail } from "@/hooks/api/queries/teacher/use-teacher";
import { formatDateHelper } from "@/lib/helper";
import type { ITeacherRosterRow, ITeacherSessionDetail } from "@/types/teacher.interface";

const statusOf = (error: unknown) =>
  (error as { response?: { status?: number } } | null)?.response?.status;

const placeLabel = (session: ITeacherSessionDetail) =>
  session.place === "online" ? "Online" : session.location || "Offline";

const typeLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

function Empty() {
  return <span className="text-brand-500">-</span>;
}

function ClampedText({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false);
  if (!text) return <Empty />;
  const long = text.length > 90;
  return (
    <div className="max-w-xs">
      <p className={open ? "break-words" : "line-clamp-2 break-words"}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function Instagram({ handle }: { handle: string | null }) {
  if (!handle) return <Empty />;
  const value = handle.trim().replace(/^@/, "");
  if (!value) return <Empty />;
  return (
    <a
      href={`https://instagram.com/${encodeURIComponent(value)}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center break-all text-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      @{value}
    </a>
  );
}

function AttendanceBadge({ status }: { status: ITeacherRosterRow["attendance_status"] }) {
  if (status === "attended") {
    return <Badge className="border-brand-200 bg-brand-50 text-brand-800">Attended</Badge>;
  }
  if (status === "no_show") {
    return <Badge className="border-red-200 bg-red-50 text-red-700">No show</Badge>;
  }
  return <Badge variant="outline" className="text-brand-600">Not marked</Badge>;
}

function RosterMobile({ rows }: { rows: ITeacherRosterRow[] }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {rows.map((row) => (
        <li key={row.id} className="rounded-lg border border-brand-100 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-bold text-brand-900">{row.full_name || "-"}</p>
            <AttendanceBadge status={row.attendance_status} />
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-semibold text-brand-600">Instagram</dt>
              <dd className="mt-0.5"><Instagram handle={row.instagram_username} /></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-brand-600">Medical notes</dt>
              <dd className="mt-0.5 text-brand-800"><ClampedText text={row.medical_notes} /></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-brand-600">Admin remark</dt>
              <dd className="mt-0.5 text-brand-800"><ClampedText text={row.notes} /></dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function RosterTable({ rows }: { rows: ITeacherRosterRow[] }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-brand-100 bg-white sm:block">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-700">
          <tr>
            <th scope="col" className="w-[20%] px-4 py-3 font-semibold">Name</th>
            <th scope="col" className="w-[18%] px-4 py-3 font-semibold">Instagram</th>
            <th scope="col" className="w-[26%] px-4 py-3 font-semibold">Medical notes</th>
            <th scope="col" className="w-[22%] px-4 py-3 font-semibold">Admin remark</th>
            <th scope="col" className="w-[14%] px-4 py-3 font-semibold">Attendance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="px-4 py-3 font-semibold text-brand-900">{row.full_name || "-"}</td>
              <td className="px-4 py-3"><Instagram handle={row.instagram_username} /></td>
              <td className="px-4 py-3 text-brand-800"><ClampedText text={row.medical_notes} /></td>
              <td className="px-4 py-3 text-brand-800"><ClampedText text={row.notes} /></td>
              <td className="px-4 py-3"><AttendanceBadge status={row.attendance_status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeacherSessionDetailView() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useTeacherSessionDetail(params?.id ?? "");
  const session = data?.data;

  return (
    <div>
      <Link
        href="/teacher/sessions"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to sessions
      </Link>

      {isLoading ? (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading session">
          <Skeleton className="h-8 w-2/3 bg-brand-50" />
          <Skeleton className="h-24 w-full bg-brand-50" />
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-lg border border-brand-100 bg-white p-6 text-center">
          {statusOf(error) === 404 ? (
            <>
              <h1 className="text-lg font-bold text-brand-900">Session not found</h1>
              <p className="mt-1 text-sm text-brand-700">
                This session does not exist, or it is not assigned to you.
              </p>
              <Link
                href="/teacher/sessions"
                className="mt-3 inline-flex min-h-11 items-center rounded-md border border-brand-100 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Back to sessions
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-brand-900">Session could not be loaded</h1>
              <p className="mt-1 text-sm text-brand-700">Check your connection and try again.</p>
              <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>
                Try again
              </Button>
            </>
          )}
        </div>
      ) : !session ? (
        <div className="mt-4 rounded-lg border border-brand-100 bg-white p-6 text-center text-sm text-brand-700">
          Session not found.
        </div>
      ) : (
        <>
          <header className="mt-2 rounded-xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-brand-900">{session.session_name}</h1>
                <p className="mt-1 text-sm text-brand-700">
                  {session.class_name ? `${session.class_name} · ` : ""}
                  {typeLabel(session.type)} · {placeLabel(session)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize text-brand-700">{session.status}</Badge>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold text-brand-600">Date</dt>
                <dd className="mt-0.5 text-brand-900">{formatDateHelper(session.start_datetime, "EEEE, dd MMMM yyyy")}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-600">Time</dt>
                <dd className="mt-0.5 text-brand-900">
                  {formatDateHelper(session.start_datetime, "HH:mm")} - {formatDateHelper(session.end_datetime, "HH:mm")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-600">Confirmed roster</dt>
                <dd className="mt-0.5 text-brand-900">{session.roster.length} of {session.capacity} places</dd>
              </div>
            </dl>
          </header>

          <section className="mt-6" aria-labelledby="roster-heading">
            <h2 id="roster-heading" className="text-lg font-bold text-brand-900">Roster</h2>
            <p className="mt-1 text-sm text-brand-700">Confirmed bookings only. Attendance is read-only here.</p>
            {session.roster.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-brand-700">
                No confirmed bookings for this session.
              </div>
            ) : (
              <div className="mt-3">
                <RosterTable rows={session.roster} />
                <RosterMobile rows={session.roster} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
