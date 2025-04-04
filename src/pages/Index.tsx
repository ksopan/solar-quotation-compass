
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import LandingPage from "./LandingPage";
import CustomerDashboard from "./CustomerDashboard";
import VendorDashboard from "./VendorDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // If not authenticated, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // If authenticated, show appropriate dashboard based on user role
  return (
    <MainLayout>
      {user.role === "customer" && <CustomerDashboard />}
      {user.role === "vendor" && <VendorDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </MainLayout>
  );
};

export default Index;
