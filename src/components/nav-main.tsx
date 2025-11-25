"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  groupLabel = "Navigation",
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      count?: number;
    }[];
  }[];
  groupLabel?: string;
}) {
  const pathname = usePathname();

  // Function to check if a menu item is active
  const isItemActive = (item: (typeof items)[0]) => {
    // Check if current path matches the item URL
    if (pathname === item.url) {
      return true;
    }

    // Check if any sub-item URL matches the current path
    if (item.items) {
      return item.items.some((subItem) => pathname === subItem.url);
    }

    return false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isItemActive(item);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                {item.items ? (
                  // Collapsible item with sub-items
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      data-active={isActive}
                      className={cn(isActive ? "!bg-brand-100 font-medium" : "", "min-h-[20px]")}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  // Simple navigation item
                  <SidebarMenuButton
                    asChild
                    data-active={isActive}
                    className={cn(isActive ? "!bg-brand-500 font-medium !text-white" : "", "min-h-[20px]")}
                  >
                    <a href={item.url} className="min-h-6 py-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubItemActive = pathname === subItem.url;

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              data-active={isSubItemActive}
                              className={cn(isSubItemActive ? "!bg-brand-500 font-medium !text-white" : "", "min-h-[20px]")}
                            >
                              <a href={subItem.url} className="flex min-h-6 w-full justify-between py-2">
                                <span>{subItem.title}</span>
                                {Number(subItem.count) > 0 && <Badge variant={"destructive"}>{Number(subItem.count)}</Badge>}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
