export type TPurchaseKind = "credit" | "class" | "product" | "other";

export function getPurchaseKind(payableType?: string | null): TPurchaseKind {
  switch (String(payableType ?? "")) {
    case "package_purchase":
      return "credit";
    case "booking":
      return "class";
    case "order":
      return "product";
    default:
      return "other";
  }
}

export const PURCHASE_KIND_LABEL: Record<TPurchaseKind, string> = {
  credit: "Credit",
  class: "Class",
  product: "Product",
  other: "Other",
};

export const PURCHASE_KIND_BADGE: Record<TPurchaseKind, string> = {
  credit: "bg-brand-50 text-brand-600",
  class: "bg-sky-50 text-sky-700",
  product: "bg-emerald-50 text-emerald-700",
  other: "bg-gray-100 text-gray-600",
};

export const PURCHASE_KIND_ICON_BG: Record<TPurchaseKind, string> = {
  credit: "bg-brand-500",
  class: "bg-sky-600",
  product: "bg-emerald-600",
  other: "bg-gray-400",
};
