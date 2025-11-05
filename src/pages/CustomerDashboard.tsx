
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DashboardStats } from "@/components/customer/DashboardStats";
import { DashboardTabs } from "@/components/customer/DashboardTabs";
import { QuestionnaireProfile } from "@/components/customer/QuestionnaireProfile";
import { useCustomerQuotations } from "@/hooks/useCustomerQuotations";
import { useAuth } from "@/contexts/auth";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("quotations");
  const { quotations, loading, fetchQuotations, deleteQuotation: deleteQuotationRequest } = useCustomerQuotations(user);

  // Check URL params for tab navigation
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "profile") {
      setActiveTab("profile");
    }
  }, [searchParams]);

  // Load data only once when the component mounts or when user changes
  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user, fetchQuotations]);

  const handleQuotationSubmitted = () => {
    fetchQuotations();
    setActiveTab("quotations");
  };

  const handleRefresh = () => {
    fetchQuotations();
  };

  const deleteQuotation = async (id: string): Promise<boolean> => {
    try {
      await deleteQuotationRequest(id);
      return true;
    } catch (error) {
      console.error("Error deleting quotation:", error);
      return false;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>
        
        <DashboardStats quotations={quotations} />
        
        <DashboardTabs
          quotations={quotations}
          loading={loading}
          onQuotationSubmitted={handleQuotationSubmitted}
          onRefresh={handleRefresh}
          deleteQuotation={deleteQuotation}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "profile" && (
          <QuestionnaireProfile />
        )}
      </div>
    </MainLayout>
  );
};

export default CustomerDashboard;
