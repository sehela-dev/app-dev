import { RefundStatus } from "@/types/refund.interface";

export const refundStatusLabel = (status: RefundStatus): string => {
  switch (status) {
    case "requested":
      return "Refund Requested";
    case "succeeded":
      return "Approved";
    case "failed":
      return "Rejected";
    default:
      return status;
  }
};

export const refundStatusClass = (status: RefundStatus): string => {
  switch (status) {
    case "requested":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    case "succeeded":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "";
  }
};