import { Store, Users, ShoppingCart, BarChart2, Receipt, Gem, CalendarCheck, PackageSearch, Tag, UserSquare2 } from "lucide-react";

export const dataNavMain = [
  { title: "Commerce", url: "#", icon: Store }, // 🛍️ icon visual → Store sudah mewakili group
  { title: "Attendence", url: "#", icon: Users },
  { title: "Orders", url: "#", icon: ShoppingCart },
];
export const dataNavMarketPlace = [
  { title: "Reporting and Analytics", url: "/admin/dashboard", icon: BarChart2 },
  { title: "Orders", url: "/admin/orders", isActive: true, icon: Receipt },
  // { title: "Credit Packages", url: "#", icon: Gem },
  {
    title: "Class",
    url: "#",
    icon: CalendarCheck,
    items: [
      { title: "Classes", url: "/admin/class", icon: CalendarCheck },
      { title: "Sessions", url: "/admin/session", icon: CalendarCheck },
      { title: "Instructor", url: "/admin/instructor", icon: Users },
    ],
  },
  // {
  //   title: "Products",
  //   url: "#",
  //   icon: PackageSearch,
  //   items: [
  //     { title: "Products", url: "#", icon: PackageSearch },
  //     { title: "Categories", url: "#", icon: Tag },
  //   ],
  // },
  // { title: "Discounts", url: "#", icon: Tag },
  // { title: "Customers", url: "#", icon: UserSquare2 },
];
