
import React from "react";
import { Users, FileText, Settings } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const AdminMenuItems: React.FC = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/manage-customers">
            <Users className="h-4 w-4 mr-2" />
            <span>Manage Customers</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/manage-vendors">
            <Users className="h-4 w-4 mr-2" />
            <span>Manage Vendors</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/all-quotations">
            <FileText className="h-4 w-4 mr-2" />
            <span>All Quotations</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/system-settings">
            <Settings className="h-4 w-4 mr-2" />
            <span>System Settings</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
