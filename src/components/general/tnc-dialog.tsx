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
import { TNC_PARAGRAPHS } from "@/constants/nav-item";

export { TNC_PARAGRAPHS };



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
