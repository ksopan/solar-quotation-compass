
import React from "react";
import { useAuth } from "@/contexts/auth";
import { DashboardStats } from "@/components/customer/DashboardStats";
import { DashboardTabs } from "@/components/customer/DashboardTabs";
import { useCustomerQuotations } from "@/hooks/useCustomerQuotations";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { quotations, loading, fetchQuotations } = useCustomerQuotations(user);

  const handleQuotationSubmitted = () => {
    // Refresh the quotations list
    fetchQuotations();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
      
      <DashboardTabs 
        quotations={quotations} 
        loading={loading} 
        onQuotationSubmitted={handleQuotationSubmitted}
        onRefresh={fetchQuotations}
      />
      
      <DashboardStats quotations={quotations} />
    </div>
  );
};

export default CustomerDashboard;
