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

export const movementTypeLabel = (v?: string | null): string => {
  if (!v) return "-";
  return v.replace(/_/g, " ");
};

export const movementTypeClass = (v?: string | null): string => {
  switch (v) {
    case "voided":
      return "bg-zinc-100 text-zinc-700 border-zinc-300";
    case "refund":
    case "outstanding":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "collected":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    case "cancel":
    case "canceled":
    case "cancelled":
      return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    case "settlement":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};