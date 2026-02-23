"use client";
import { Gem, Menu, X } from "lucide-react";
import { LogoComponent } from "../asset/logo";
import { Button } from "../ui/button";
import { Fragment, useState } from "react";
import { Divider } from "../ui/divider";
import { useAuthMember } from "@/context/member.ctx";

export const MainHeaderComponent = () => {
  const { user, isAuthenticated } = useAuthMember();
  return (
    <div className="bg-gray-50 min-h-[58px] sticky top-0 z-50 w-full shadow-subtle shrink-0 ">
      <div className="flex flex-row items-center justify-between w-full p-3">
        <div className="flex flex-1">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex">
            <Button className="border-brand-50 text-brand-500 text-sm font-serif leading-[130%] font-extrabold rounded-lg" variant={"outline"}>
              <Gem color="var(--color-brand-500)" />
              {user?.profile?.overview?.credits_balance ?? 0} Credits
            </Button>
          </div>

          <div className="flex">
            <MobileMenu isLoggedIn={isAuthenticated} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileMenuProps {
  items?: Array<{ label: string; href: string; external?: boolean }>;
  isLoggedIn: boolean;
}

export const MobileMenu = ({ items = [], isLoggedIn }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // not loggedin
  const defaultItems = [
    { label: "Login", href: "/auth/login" },
    { label: "About", href: "https://sehelaspace.com", external: true },

    { label: "Terms and Conditions", href: "/terms-and-conditions" },
  ];

  const userMenu = [
    { label: "Account Settings", href: "/profile" },
    { label: "My Sessions", href: "/profile/sessions" },
    { label: "About", href: "https://sehelaspace.com", external: true },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Logout", action: "logout", danger: true },
  ];

  const menu = isLoggedIn ? userMenu : defaultItems;

  /* 
  Account Settings
My Orders
Help
About
Logout 
*/

  const menuItems = items.length > 0 ? items : defaultItems;

  return (
    <>
      {/* Hamburger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="borborder-brand-50 rounded-lg bg-brand-500 duration-300 hover:bg-brand-600"
        variant="outline"
        aria-label="Toggle menu"
      >
        {isOpen ? <X color="var(--color-gray-50)" size={20} /> : <Menu color="var(--color-gray-50)" size={20} />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed top-[58px] left-0 right-0 bottom-0 bg-black/20 z-40 max-w-[414px] mx-auto"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-[58px] left-0 right-0 bg-brand-50 shadow-lg z-40 transition-all duration-300 ease-out max-w-[414px] mx-auto ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="flex flex-col p-4 gap-2">
          {menu.map((item, index: number) => (
            <Fragment key={index}>
              <a
                href={item.href}
                className="px-4 py-3 text-brand-700 hover:bg-brand-100 rounded-lg font-medium transition-colors text-sm"
                onClick={() => setIsOpen(false)}
                target={item?.external ? "_blank" : "_self"}
              >
                {item.label}
              </a>
              {index <= menuItems?.length && <Divider />}
            </Fragment>
          ))}
        </nav>
      </div>
    </>
  );
};
