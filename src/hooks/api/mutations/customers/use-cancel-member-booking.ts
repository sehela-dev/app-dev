/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelMemberBooking } from "@/api-req/customer-app";

const CANCEL_ERROR_COPY: Record<string, { title: string; description: string }> = {
  ALREADY_CANCELED: { title: "Already Canceled", description: "This booking is already canceled. Refreshing status." },
  SESSION_CANCELED: { title: "Session Canceled", description: "This session was canceled by admin." },
  SESSION_STARTED: { title: "Too Late to Cancel", description: "This session has already started." },
  BOOKING_EXPIRED: { title: "Booking Expired", description: "The 15-minute pay window lapsed. Please re-book." },
  INVALID_STATUS: { title: "Cannot Cancel", description: "Only confirmed or pending-payment bookings can be canceled." },
  FORBIDDEN: { title: "Not Your Booking", description: "You can only cancel your own bookings." },
  NOT_FOUND: { title: "Not Found", description: "Booking or session not found. Refresh the list." },
  UNAUTHORIZED: { title: "Session Expired", description: "Please login again." },
};

export const useCancelMemberBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, cancel_reason, choice }: { bookingId: string; cancel_reason?: string; choice?: "burn" | "refund_with_penalty" }) =>
      cancelMemberBooking(bookingId, { ...(cancel_reason ? { cancel_reason } : null), ...(choice ? { choice } : null) }),
    onError: (error: AxiosError<any>) => {
      const code = error?.response?.data?.error?.code ?? error?.response?.data?.code;
      const message = error?.response?.data?.error?.message ?? error?.response?.data?.message;
      const mapped = code ? CANCEL_ERROR_COPY[code] : undefined;
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
      if (mapped) {
        return toast.error(mapped.title, { id: "cancel-error", description: message ?? mapped.description, position: "top-center" });
      }
      if (error?.response && error?.response?.status < 500) {
        return toast.error(code ?? "ERROR", {
          id: "cancel-error",
          description: message ?? "Unable to cancel booking. Please try again.",
          position: "top-center",
        });
      }
      return toast.error("Something Wrong!", { id: "cancel-error", description: "Please try again later!", position: "top-center" });
    },
    onSuccess: (_data, variables) => {
      // Only invalidate + toast for terminal states here; the detail page
      // handles requires_choice / penalty_pending UI itself.
      const result = (_data as any)?.data?.result;
      const window = (_data as any)?.data?.window;
      if (result === "burned" || window === "free") {
        queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
        queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session", "my-session-detail", variables.bookingId] });
      }
    },
  });
};
