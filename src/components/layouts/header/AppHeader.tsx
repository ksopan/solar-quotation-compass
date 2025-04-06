
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@/contexts/auth/types";

interface AppHeaderProps {
  user: User | null;
  onLogout: () => void;
  getDisplayName: () => string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout, getDisplayName }) => {
  const navigate = useNavigate();
  
  return (
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
          <Button variant="outline" size="sm" onClick={onLogout} className="md:hidden">
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
  );
};
