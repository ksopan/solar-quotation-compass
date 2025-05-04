
import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/auth";
import { CustomerDashboard } from "./CustomerDashboard";
import { VendorDashboard } from "./VendorDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { LandingPage } from "./LandingPage";
import { DatabaseDebugView } from "@/components/admin/DatabaseDebugView";

const Index = () => {
  const { user } = useAuth();

  // Return different dashboards based on user role
  if (!user) {
    return <LandingPage />;
  }

  return (
    <MainLayout>
      {user.role === "customer" && <CustomerDashboard />}
      {user.role === "vendor" && (
        <div className="space-y-8">
          <VendorDashboard />
          <DatabaseDebugView />
        </div>
      )}
      {user.role === "admin" && <AdminDashboard />}
    </MainLayout>
  );
};

export default Index;
