import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeWaitlistEntry } from "@/api-req/class-session";

// No toasts here: screen owns user-facing copy (removed:false = never joined, not an error).
export const useRemoveWaitlistEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWaitlistEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "orders", "session", "waitlist"] });
    },
  });
};
