import { useMutation, useQueryClient } from "@tanstack/react-query";

import { joinWaitlist } from "@/api-req/customer-app";

// No toasts here: error codes (SESSION_STARTED, SESSION_CANCELED, ...) need
// screen-specific copy, so the calling screen owns all user-facing messages.
export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "waitlist"] });
    },
  });
};
