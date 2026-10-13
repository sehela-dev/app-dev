"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { getAdminBookingDetail, changeAttendanceStatus } from "@/api-req";
import { useGetSessionBookings, useGetSessions } from "@/hooks/api/queries/admin/class-session";
import type { IAdminBookingDetail } from "@/types/orders.interface";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

const READER_ID = "checkin-qr-reader";

// Konten popup Radix me-mount telat 1-2 frame setelah open=true.
// Tunggu div tersedia dulu sebelum new Html5Qrcode, max ~2 detik.
const waitForEl = async (id: string, tries = 20): Promise<boolean> => {
  for (let i = 0; i < tries; i++) {
    if (document.getElementById(id)) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
};

type Result = IAdminBookingDetail & { code: string };
type ApiErr = { success?: boolean; error?: { code?: string; message?: string } };

const errOf = (e: unknown) => {
  const err = e as AxiosError<ApiErr>;
  return { status: err?.response?.status, code: err?.response?.data?.error?.code };
};

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate font-medium text-foreground">{value}</span>
      </span>
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function StatusBadge({ done, bookingStatus }: { done?: boolean; bookingStatus: string }) {
  if (done) {
    return (
      <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> Checked In
      </Badge>
    );
  }
  if (bookingStatus === "confirmed") {
    return (
      <Badge variant="outline" className="gap-1.5 border-brand-500/40 bg-brand-50 text-brand-500">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> Confirmed
      </Badge>
    );
  }
  if (bookingStatus === "pending_payment") {
    return (
      <Badge className="gap-1.5 border-amber-500/30 bg-amber-500/15 text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> Pending Payment
      </Badge>
    );
  }
  return (
    <Badge className="gap-1.5 border-red-500/30 bg-red-500/10 capitalize text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {bookingStatus.replace(/_/g, " ")}
    </Badge>
  );
}

// Peserta per sesi, dimuat on-demand saat row di-expand (hemat request)
function SessionAttendees({ id }: { id: string }) {
  const { data, isLoading } = useGetSessionBookings({ id, page: 1, limit: 100 });
  const list = data?.data ?? [];
  if (isLoading) return <p className="py-2 text-sm text-muted-foreground">Memuat peserta…</p>;
  if (!list.length) return <p className="py-2 text-sm text-muted-foreground">Belum ada booking.</p>;
  return (
    <div className="divide-y divide-border">
      {list.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{p.customer_name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.customer_phone}</p>
          </div>
          <StatusBadge done={p.attendance_status === "attended"} bookingStatus={p.booking_status} />
        </div>
      ))}
    </div>
  );
}

export const CheckedInPage = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cams, setCams] = useState<{ id: string; label: string }[]>([]);
  const [camId, setCamId] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);

  const today = defaultDate().formattedToday;
  const { data: sessionsRes, isLoading: sessionsLoading } = useGetSessions({ page: 1, limit: 100, date: today });
  const sessions = sessionsRes?.data ?? [];

  const lookup = useCallback(async (key: string) => {
    const k = key.trim();
    setResult(null);
    setError(null);
    if (!k) {
      setError("Scan atau ketik kode booking dulu.");
      return;
    }
    setSearching(true);
    try {
      const res = await getAdminBookingDetail(k);
      const booking = res.data;
      setResult({ ...booking, code: k });
      if (booking.attendance_status === "attended") setError("Sudah check-in sebelumnya.");
    } catch (e) {
      const { status, code: errCode } = errOf(e);
      if (status === 404 || errCode === "BOOKING_NOT_FOUND") {
        setError("Booking tidak ditemukan. Cek kode / sesi yang benar.");
      } else if (status === 401 || status === 403) {
        setError("Sesi admin berakhir / tidak punya akses. Login ulang.");
      } else {
        setError("Gagal mencari booking. Coba lagi.");
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const stopCamera = useCallback(async () => {
    setScanning(false);
    runningRef.current = false;
    const qr = qrRef.current;
    qrRef.current = null;
    if (qr) {
      try {
        if (qr.isScanning) await qr.stop();
      } catch {
        // sudah berhenti, abaikan
      }
      try {
        qr.clear();
      } catch {
        // elemen sudah unmount, abaikan
      }
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    // getUserMedia hanya jalan di secure context (localhost/HTTPS).
    if (!window.isSecureContext) {
      setError("Koneksi tidak aman (bukan localhost/HTTPS) — Chrome mematikan kamera. Buka via http://localhost:3000.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser tidak support kamera. Pakai input manual / USB scanner.");
      return;
    }
    try {
      // minta izin dulu biar gagal cepat dengan pesan jelas, stream langsung dilepas
      const probe = await navigator.mediaDevices.getUserMedia({ video: true });
      probe.getTracks().forEach((t) => t.stop());
      // pilih device eksplisit — facingMode:"environment" sering ditolak webcam laptop
      const devices = await Html5Qrcode.getCameras();
      if (!devices.length) {
        setError("Tidak ada kamera terdeteksi di perangkat ini. Pakai input manual / USB scanner.");
        return;
      }
      setCams(devices);
      const back = devices.find((d) => /back|rear|environment/i.test(d.label));
      setCamId(back?.id ?? devices[devices.length - 1].id);
      runningRef.current = false;
      setScanning(true);
    } catch {
      setError("Izin kamera ditolak / kamera tidak tersedia. Klik ikon kamera di address bar lalu Allow, reload, coba lagi.");
    }
  };

  // Jalan saat popup kebuka (div reader sudah mount). Restart tiap ganti kamera.
  useEffect(() => {
    if (!scanning || !camId) return;
    let cancelled = false;
    const boot = async () => {
      try {
        const mounted = await waitForEl(READER_ID);
        if (cancelled) {
          await stopCamera();
          return;
        }
        if (!mounted) {
          setScanning(false);
          setError("Popup scanner gagal dibuka. Tutup lalu tekan Scan via kamera lagi.");
          return;
        }
        const qr = new Html5Qrcode(READER_ID);
        qrRef.current = qr;
        await qr.start(
          { deviceId: { exact: camId } },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (value) => {
            if (!value) return;
            void stopCamera();
            setCode(value);
            void lookup(value);
          },
          () => {}
        );
        if (cancelled) {
          await stopCamera();
          return;
        }
        runningRef.current = true;
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
          setScanning(false);
          setError(`Kamera gagal dibuka (${msg}). Tutup aplikasi lain yang memakai kamera / pilih kamera lain.`);
        }
      }
    };
    void boot();
    return () => {
      cancelled = true;
      void stopCamera();
    };
  }, [scanning, camId, stopCamera, lookup]);

  useEffect(
    () => () => {
      void stopCamera();
    },
    [stopCamera]
  );

  const handleConfirm = async () => {
    if (!result || confirming) return;
    if (result.attendance_status === "attended") return; // idempotent, tanpa PATCH
    setConfirming(true);
    try {
      await changeAttendanceStatus({ id: result.code, attendance_status: "attended" });
      setResult({ ...result, attendance_status: "attended" });
      setError(null);
      toast.success("Checked in", { description: result.customer_name, position: "top-center" });
    } catch (e) {
      const { code: errCode } = errOf(e);
      if (errCode === "INVALID_BOOKING_STATUS") {
        setError("Booking tidak valid untuk check-in (belum lunas / dibatalkan / kedaluwarsa).");
      } else {
        toast.error("Gagal check-in", { description: "Coba lagi.", position: "top-center" });
      }
    } finally {
      setConfirming(false);
    }
  };

  const done = result?.attendance_status === "attended";
  const sessionOff = result && result.class_session.status !== "scheduled";

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4 px-4 py-6">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Attendence</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Checked In</span>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-medium">Scan QR Code</p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup(code)}
              placeholder="Scan / paste booking id"
              autoFocus={!scanning}
            />
            <Button onClick={() => lookup(code)} disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
          <Button variant="outline" className="w-full" onClick={startCamera}>
            <Camera className="h-4 w-4" /> Scan via kamera
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-brand-500 font-semibold text-white">
                    {initials(result.customer_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold leading-tight">{result.customer_name}</h2>
                  <p className="truncate text-xs text-muted-foreground">Booking {result.code.slice(0, 8)}…</p>
                </div>
                <StatusBadge done={done} bookingStatus={result.booking_status} />
              </div>

              {sessionOff && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span className="flex flex-wrap items-center gap-1.5">
                    Sesi berstatus
                    <Badge className="border-amber-500/40 bg-amber-500/20 capitalize text-amber-800">
                      {result.class_session.status}
                    </Badge>
                    — pastikan dengan admin sebelum check-in.
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="pb-1 text-sm font-semibold">Customer Information</p>
                <Row icon={Phone} label="Phone" value={result.customer_phone} />
                <Row icon={Mail} label="Email" value={result.customer_email} />
              </div>

              <div className="border-t pt-3">
                <p className="pb-1 text-sm font-semibold">Class Information</p>
                <Row icon={Tag} label="Class Type" value={result.class_session.class?.class_name ?? result.class_session.type} />
                <Row icon={CalendarDays} label="Session" value={result.class_session.session_name} />
                <Row icon={User} label="Instructor" value={result.class_session.instructor_name} />
                <Row icon={MapPin} label="Place" value={result.class_session.place} />
                <Row
                  icon={Clock}
                  label="Class Time"
                  value={`${formatDateHelper(result.class_session.start_datetime, "MMMM d, yyyy HH:mm")} WIB`}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <Badge variant="outline" className="gap-1.5 capitalize">
                  <Banknote className="h-3.5 w-3.5" /> {result.payment_method}
                </Badge>
                <span className="font-semibold">{formatCurrency(result.price_idr)}</span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" disabled={done || confirming} onClick={handleConfirm}>
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming...
              </>
            ) : done ? (
              "Already Checked In"
            ) : (
              "Confirm Check-In"
            )}
          </Button>
        </>
      )}

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sesi Hari Ini</p>
            <Badge variant="outline">{formatDateHelper(today, "d MMM yyyy")}</Badge>
          </div>
          {sessionsLoading ? (
            <p className="text-sm text-muted-foreground">Memuat sesi…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada sesi hari ini.</p>
          ) : (
            <div className="divide-y divide-border rounded-lg border">
              {sessions.map((s) => (
                <div key={s.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 p-3 text-left"
                    onClick={() => setOpenSession(openSession === s.id ? null : s.id)}
                  >
                    <span className="w-14 shrink-0 rounded-md bg-brand-50 px-1 py-1.5 text-center text-xs font-semibold text-brand-500">
                      {s.time_start}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.session_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.class?.class_name} • {s.instructor_name}
                      </span>
                    </span>
                    {s.status !== "scheduled" && (
                      <Badge className="shrink-0 border-red-500/30 bg-red-500/10 capitalize text-red-700">
                        {s.status}
                      </Badge>
                    )}
                    <Badge variant="outline" className="shrink-0">
                      {s.slots_booked}/{s.slots_total}
                    </Badge>
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", openSession === s.id && "rotate-180")}
                    />
                  </button>
                  {openSession === s.id && (
                    <div className="space-y-1 border-t px-3 py-2">
                      <SessionAttendees id={s.id} />
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => router.push(`/admin/session/${s.id}`)}
                      >
                        Buka detail sesi <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BaseDialogComponent
        isOpen={scanning}
        title="Scan QR Code"
        onClose={stopCamera}
        onCloseText="Tutup kamera"
        btnConfirm=""
      >
        <div id={READER_ID} className="overflow-hidden rounded-lg" />
        {cams.length > 1 && (
          <select
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={camId ?? ""}
            onChange={(e) => setCamId(e.target.value)}
          >
            {cams.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.label || `Kamera ${i + 1}`}
              </option>
            ))}
          </select>
        )}
        <p className="pt-2 text-center text-sm text-muted-foreground">Arahkan kamera ke QR booking user…</p>
      </BaseDialogComponent>
    </div>
  );
};
