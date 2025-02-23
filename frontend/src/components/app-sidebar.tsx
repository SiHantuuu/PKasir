import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-react";

type MenuItem = {
  title: string;
  url: string;
  items?: { title: string; url: string; isActive?: boolean }[];
};

const navMain: MenuItem[] = [
  { title: "Dashboard", url: "/" },
  { title: "Product", url: "/Product" },
  { title: "History", url: "/History" },
  { title: "Top Up", url: "/Top_Up" },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="leading-none">
                  <span className="font-semibold block">PKasir</span>
                  <span>v100</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map(({ title, url, items }) => (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton asChild>
                  <a href={url} className="font-medium">{title}</a>
                </SidebarMenuButton>
                {items && items.length > 0 && (
                  <SidebarMenuSub>
                    {items.map(({ title, url, isActive }) => (
                      <SidebarMenuSubItem key={title}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <a href={url}>{title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
