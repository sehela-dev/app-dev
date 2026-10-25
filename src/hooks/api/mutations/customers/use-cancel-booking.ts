import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelBooking } from "@/api-req/customer-app";

// No toasts here: probe, burn, penalty and each error code need their own copy,
// so the calling screen owns all user-facing messages.
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-credits"] });
    },
  });
};
