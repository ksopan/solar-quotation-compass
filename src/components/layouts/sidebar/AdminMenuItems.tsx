
import React from "react";
import { Users, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const AdminMenuItems: React.FC = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/manage-customers">
            <Users className="h-4 w-4 mr-2" />
            <span>Manage Customers</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/manage-vendors">
            <Users className="h-4 w-4 mr-2" />
            <span>Manage Vendors</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/all-quotations">
            <FileText className="h-4 w-4 mr-2" />
            <span>All Quotations</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/system-settings">
            <Settings className="h-4 w-4 mr-2" />
            <span>System Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
