
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useVendorQuotations } from "@/hooks/vendor";
import { PropertyQuestionnaireItem } from "@/hooks/vendor";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Show fewer items on dashboard
  
  // Use the hook directly
  const { questionnaires, loading, stats, fetchQuestionnaires } = useVendorQuotations(user);

  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with questionnaires:", questionnaires);
  }, [questionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchQuestionnaires(page, itemsPerPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.companyName || 'Vendor'}!</h1>
        <Button onClick={() => navigate("/quotation-requests")}>View All Requests</Button>
      </div>

      <DashboardStats stats={stats} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Property Questionnaires</h2>
        <QuestionnaireFilters />
      </div>
      
      <QuestionnairesTable 
        questionnaires={questionnaires}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default VendorDashboard;
