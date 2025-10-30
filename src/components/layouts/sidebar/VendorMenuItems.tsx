
import React from "react";
import { FileText, BarChart, Settings } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const VendorMenuItems: React.FC = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/quotation-requests">
            <FileText className="h-4 w-4 mr-2" />
            <span>Quotation Requests</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/my-proposals">
            <BarChart className="h-4 w-4 mr-2" />
            <span>My Proposals</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="/vendor-profile">
            <Settings className="h-4 w-4 mr-2" />
            <span>Company Profile</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
