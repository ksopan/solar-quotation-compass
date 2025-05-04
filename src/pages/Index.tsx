
import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
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

  return (
    <MainLayout>
      {user.role === "customer" && <CustomerDashboard />}
      {user.role === "vendor" && <VendorDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </MainLayout>
  );
};

export default Index;
