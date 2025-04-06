
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup
} from "@/components/ui/sidebar";
import { Sun, Moon, LogOut, Home, FileText, Users, User, Settings, BarChart } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  // Get display name based on user role and available fields
  const getDisplayName = () => {
    if (!user) return "";
    
    if (user.role === "vendor") {
      return user.companyName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    } else if (user.role === "admin") {
      return user.fullName || "Admin";
    } else {
      // Customer
      return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {user && (
          <AppSidebar userRole={user.role} onLogout={handleLogout} />
        )}
        <div className="flex-1">
          <header className="bg-background border-b p-4 flex justify-between items-center">
            <div className="flex items-center">
              {user && <SidebarTrigger />}
              <h1 className="text-2xl font-bold ml-2 text-primary">Solar Quotation Compass</h1>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {getDisplayName()}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="default" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </div>
            )}
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

interface AppSidebarProps {
  userRole: string;
  onLogout: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole, onLogout }) => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Sun className="h-5 w-5 text-white" />
        </div>
        <span className="ml-2 font-bold">Solar Compass</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {userRole === "customer" && (
              <>
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
            )}

            {userRole === "vendor" && (
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
                    <a href="/complete-profile">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Company Profile</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            {userRole === "admin" && (
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
            )}
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
