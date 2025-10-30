
import React from "react";
import { FileText, BarChart, Settings, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const VendorMenuItems: React.FC = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/quotation-requests">
            <FileText className="h-4 w-4 mr-2" />
            <span>Quotation Requests</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/my-proposals">
            <BarChart className="h-4 w-4 mr-2" />
            <span>My Proposals</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/vendor-profile">
            <Settings className="h-4 w-4 mr-2" />
            <span>Company Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
