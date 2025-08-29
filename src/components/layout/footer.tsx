"use client";

import Link from "next/link";
import { Home, Calendar, ShoppingBag, User } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/book", label: "Book Class", icon: Calendar },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
];

export function MainBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="min-h-16 shrink-0  bg-gray-50 backdrop-blur shadow-subtle ">
      <ul className="grid grid-cols-4 h-full py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex items-center justify-center ">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors w-[90px]
                  ${active ? "bg-brand-50 text-brand-500" : "text-brand-400 hover:bg-brand-50"}`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
