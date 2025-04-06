
import React from "react";
import { Home, FileText, User } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const CustomerMenuItems: React.FC = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/">
            <Home className="h-4 w-4 mr-2" />
            <span>Dashboard</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/quotations">
            <FileText className="h-4 w-4 mr-2" />
            <span>My Quotations</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/complete-profile">
            <User className="h-4 w-4 mr-2" />
            <span>My Profile</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
