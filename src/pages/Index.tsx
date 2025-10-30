
import React from "react";
import { useAuth } from "@/contexts/auth";
import VendorDashboard from "./VendorDashboard";
import AdminDashboard from "./AdminDashboard";
import LandingPage from "./LandingPage";
import CustomerDashboard from "./CustomerDashboard";

const Index = () => {
  const { user } = useAuth();

  // Return different dashboards based on user role
  if (!user) {
    return <LandingPage />;
  }

  // Each dashboard component now handles its own MainLayout
  if (user.role === "customer") return <CustomerDashboard />;
  if (user.role === "vendor") return <VendorDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  
  return null;
};

export default Index;
