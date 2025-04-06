
import React from "react";
import { User } from "@/contexts/auth/types";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarGroup
} from "@/components/ui/sidebar";
import { CustomerMenuItems } from "./CustomerMenuItems";
import { VendorMenuItems } from "./VendorMenuItems";
import { AdminMenuItems } from "./AdminMenuItems";
import { SidebarBranding } from "./SidebarBranding";

interface AppSidebarProps {
  user: User;
  onLogout: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ user, onLogout }) => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <SidebarBranding />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {user.role === "customer" && <CustomerMenuItems />}
            {user.role === "vendor" && <VendorMenuItems />}
            {user.role === "admin" && <AdminMenuItems />}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
