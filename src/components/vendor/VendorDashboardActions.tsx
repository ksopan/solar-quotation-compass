
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VendorDashboardActionsProps {
  onRefresh: () => void;
  onCheckPermissions: () => void;
}

export const VendorDashboardActions: React.FC<VendorDashboardActionsProps> = ({ 
  onRefresh, 
  onCheckPermissions 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onCheckPermissions}>
        <ShieldAlert className="h-4 w-4 mr-2" /> Check Permissions
      </Button>
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
      </Button>
      <Button onClick={() => navigate("/quotation-requests")}>View All Requests</Button>
    </div>
  );
};
