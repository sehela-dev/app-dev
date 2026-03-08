import { Store, Users, ShoppingCart, BarChart2, Receipt, Gem, CalendarCheck, PackageSearch, Tag, DollarSign } from "lucide-react";

export const dataNavMain = [
  { title: "Commerce", url: "#", icon: Store }, // 🛍️ icon visual → Store sudah mewakili group
  { title: "Attendence", url: "#", icon: Users },
  { title: "Orders", url: "#", icon: ShoppingCart },
];
export const dataNavMarketPlace = [
  { title: "Reporting and Analytics", url: "/admin/dashboard", icon: BarChart2, permission: "dashboard:view" },
  { title: "Orders", url: "/admin/orders", isActive: true, icon: Receipt, permission: "order:view" },
  { title: "Credit Packages", url: "/admin/credit-packages", icon: Gem, permission: "credit_package:view" },
  {
    title: "Class",
    url: "#",
    icon: CalendarCheck,
    // permission: "class:view",

    items: [
      { title: "Classes", url: "/admin/class", icon: CalendarCheck, permission: "class:view" },
      { title: "Sessions", url: "/admin/session", icon: CalendarCheck, permission: "session:view" },
      { title: "Instructor", url: "/admin/instructor", icon: Users, permission: "instructor:view" },
    ],
  },
  {
    title: "Products",
    url: "#",
    icon: PackageSearch,
    items: [{ title: "Products", url: "/admin/products", icon: PackageSearch, permission: "products:view" }],
  },
  { title: "Discount Voucher", url: "/admin/discount-voucher", icon: Tag, permission: "voucher:view" },
  // { title: "Discounts", url: "#", icon: Tag },
  { title: "Members", url: "/admin/member", icon: Users, permission: "member:view" },
];

export const dataNavReport = [
  { title: "Outstanding Credit", url: "/admin/report/outstanding-credit", icon: DollarSign, permission: "outstanding:view" }, // 🛍️ icon visual → Store sudah mewakili group
];
