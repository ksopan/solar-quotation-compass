
import React from "react";
import { Home, FileText, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const CustomerMenuItems: React.FC = () => {
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
          <Link to="/quotations">
            <FileText className="h-4 w-4 mr-2" />
            <span>My Quotations</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/complete-profile">
            <User className="h-4 w-4 mr-2" />
            <span>My Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
