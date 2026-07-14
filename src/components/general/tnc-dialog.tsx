"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const TNC_PARAGRAPHS = [
  "Seluruh ketentuan dalam dokumen ini terkait dengan keikutsertaan Saya pada kegiatan yang diselenggarakan oleh PT Ruang Bugar Sehela atau yang selanjutnya disebut sebagai “Sehela Space”.",
  "Saya mengerti dan setuju bahwa Saya diharapkan tiba di studio 10 menit sebelum jadwal kelas dimulai. Saya mengerti bahwa peserta yang datang terlambat lebih dari 10 menit setelah kelas dimulai, tidak dapat memasuki ruangan kelas dan pembayaran atas kelas tersebut tidak dapat dikembalikan (kredit kelas dianggap hangus).",
  "Saya mengerti dan setuju bahwa penjadwalan kembali atau reschedule kelas hanya dapat dilakukan 6 jam sebelum kelas dimulai, pembatalan keikutsertaan dalam waktu 6 jam dikenakan biaya penjadwalan kembali (reschedule fee) sebesar 100k untuk kelas yoga dan 125k untuk kelas prenatal pilates.",
  "Saya mengerti dan setuju bahwa biaya penjadwalan kembali (reschedule fee) tidak dapat digunakan untuk workshop, special class dan non regular class lainnya.",
  "Saya mengerti dan setuju bahwa apabila terdapat cidera dan/atau kondisi kesehatan yang harus diperhatikan, termasuk namun tidak terbatas pada cidera otot, cidera tulang, kehamilan, jahitan operasi, maka Saya wajib untuk memberitahukan sebelumnya kepada tim Sehela Space, termasuk namun tidak terbatas pada guru dan pegawai administrasi Sehela Space atas kondisi Saya secara lengkap dan memastikan bahwa Saya telah mendapatkan persetujuan dari dokter Saya untuk dapat ikutserta dalam kelas Sehela Space.",
  "Dengan ini Saya melepaskan dan/atau mengesampingkan Sehela Space dan/atau guru dan/atau pegawai dan/atau pemilik dari Sehela Space, secara masing-masing dan/atau bersama-sama, atas tuntutan apapun yang mungkin diajukan sebagai akibat dari keikutsertaan Saya atas kegiatan yang diselenggarakan oleh Sehela Space.",
  "Saya mengakui dan setuju bahwa Sehela Space, guru dan/atau pegawai Sehela Space bukan tenaga medis professional dan tidak dapat memberikan nasihat atas kondisi kesehatan Saya.",
  "Saya mengakui dan menyetujui bahwa terdapat resiko fisik yang mungkin terlibat dalam pelaksanaan kelas dan Saya tidak memiliki kondisi medis yang dapat menghalangi keikutsertaan Saya atas kegiatan di Sehela Space dan untuk itu, Saya bertanggung jawab secara penuh atas resiko dan/atau atau cidera yang dapat timbul setelah mengikuti kegiatan di Sehela Space.",
  "Saya mengakui dan menyetujui untuk menjaga barang bawaan Saya saat berada di Sehela Space. Sehela Space tidak bertanggung jawab atas kehilangan atau kerusakan atas barang Saya.",
  "Dalam hal terdapat barang yang tertinggal di Sehela Space, maka barang tersebut hanya akan disimpan selama 2 (dua) minggu. Dalam hal barang tersebut tidak diklaim oleh siapapun, maka Sehela Space memiliki hak untuk membuang atau mendonasikan barang tersebut.",
  "Saya mengerti dan menyetujui bahwa Sehela Space dapat melakukan dokumentasi, termasuk namun tidak terbatas pada foto, video dan/atau dokumentasi lainnya atas kegiatan yang berada di Sehela Space serta menggunakan dokumentasi tersebut di social media.",
  "Sehela Space memiliki hak untuk merubah Syarat dan Ketentuan ini dari waktu ke waktu atas kebijakannya sendiri.",
] as const;

interface TncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  title?: string;
}

export const TncDialog = ({
  open,
  onOpenChange,
  onAccept,
  title = "Terms and Conditions",
}: TncDialogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    if (!open) {
      setHasScrolledToBottom(false);
      return;
    }

    // Reset scroll position when opened; re-check in case content fits without scrolling
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = 0;
      const fitsWithoutScroll = el.scrollHeight <= el.clientHeight + 4;
      setHasScrolledToBottom(fitsWithoutScroll);
    });
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;

    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (reachedBottom) setHasScrolledToBottom(true);
  };

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 font-serif sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-4 pr-12 text-left">
          <DialogTitle className="text-brand-500">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Please scroll to the bottom to read the full document before accepting.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[min(50vh,420px)] overflow-y-auto px-6 py-4"
        >
          <ol className="list-decimal space-y-4 pl-4 text-sm leading-relaxed text-brand-500">
            {TNC_PARAGRAPHS.map((paragraph) => (
              <li key={paragraph.slice(0, 48)} className="pl-1">
                {paragraph}
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter className="shrink-0 border-t border-gray-200 px-6 py-4 sm:justify-stretch">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <div className="flex w-full">

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
            <div className="flex w-full">


              <Button
                type="button"
                className="w-full"
                disabled={!hasScrolledToBottom}
                onClick={handleAccept}
              >
                {hasScrolledToBottom ? "I Accept" : "Scroll to continue"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
