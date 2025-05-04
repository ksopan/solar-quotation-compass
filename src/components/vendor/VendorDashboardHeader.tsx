
import React from "react";
import { User } from "@/contexts/auth/types";

interface VendorDashboardHeaderProps {
  user: User;
}

export const VendorDashboardHeader: React.FC<VendorDashboardHeaderProps> = ({ user }) => {
  return (
    <h1 className="text-3xl font-bold">Welcome, {user.companyName || 'Vendor'}!</h1>
  );
};
