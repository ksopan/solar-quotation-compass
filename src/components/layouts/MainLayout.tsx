
import React from "react";
import { useAuth } from "@/contexts/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import { AppHeader } from "./header/AppHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

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
          <AppSidebar user={user} onLogout={handleLogout} />
        )}
        <div className="flex-1">
          <AppHeader 
            user={user} 
            onLogout={handleLogout} 
            getDisplayName={getDisplayName} 
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
