
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { DashboardStats } from "@/components/customer/DashboardStats";
import { DashboardTabs } from "@/components/customer/DashboardTabs";
import { useCustomerQuotations } from "@/hooks/useCustomerQuotations";
import { QuestionnaireProfile } from "@/components/customer/QuestionnaireProfile";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { quotations, loading, fetchQuotations, deleteQuotation } = useCustomerQuotations(user);
  const [activeTab, setActiveTab] = useState<string>("quotations");

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
        deleteQuotation={deleteQuotation}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === "profile" ? (
        <QuestionnaireProfile />
      ) : (
        <DashboardStats quotations={quotations} />
      )}
    </div>
  );
};

export default CustomerDashboard;
